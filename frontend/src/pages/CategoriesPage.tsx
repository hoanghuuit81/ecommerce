import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { deleteCategory, getCategories, saveCategory } from "../api/categories";
import { FieldError, FormModal } from "../components/FormModal";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import type {
  ApiError,
  Category,
  PaginationMeta,
  StatusFilter,
} from "../types/catalog";

type CategoryForm = {
  name: string;
  description: string;
  status: boolean;
};

const emptyForm: CategoryForm = { name: "", description: "", status: true };

export function CategoriesPage({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategories({ search, status, page });
      setCategories(response.data);
      setMeta(response.meta);
    } catch (error) {
      notify(
        error instanceof globalThis.Error
          ? error.message
          : "Không thể tải danh mục.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [notify, page, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadCategories(), 300);
    return () => window.clearTimeout(timeout);
  }, [loadCategories]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
    setErrors({});
  };

  const openCreateForm = () => {
    closeForm();
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      status: category.status,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await saveCategory(form, editingCategory?.id);
      notify(editingCategory ? "Đã cập nhật danh mục." : "Đã thêm danh mục.");
      closeForm();
      await loadCategories();
    } catch (error) {
      const apiError = error as ApiError;
      setErrors(apiError.fields ?? {});
      notify(apiError.message);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Xóa danh mục “${category.name}”?`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      notify("Đã xóa danh mục.");
      await loadCategories();
    } catch (error) {
      notify(
        error instanceof globalThis.Error
          ? error.message
          : "Không thể xóa danh mục.",
      );
    }
  };

  return (
    <section>
      <header>
        <div>
          <p>Danh mục</p>
          <h1>Quản lý danh mục</h1>
        </div>
        <button type="button" className="primary" onClick={openCreateForm}>
          + Thêm danh mục
        </button>
      </header>
      <div className="filters">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Tìm tên hoặc mô tả…"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as StatusFilter);
            setPage(1);
          }}
          aria-label="Lọc trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="1">Hoạt động</option>
          <option value="0">Tạm dừng</option>
        </select>
      </div>
      <div className="panel">
        {isLoading ? (
          <p className="empty">Đang tải…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                    <small>
                      /{category.slug} ·{" "}
                      {category.description || "Chưa có mô tả"}
                    </small>
                  </td>
                  <td>{category.products_count ?? 0}</td>
                  <td>
                    <StatusBadge active={category.status} />
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      onClick={() => openEditForm(category)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void handleDelete(category)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && categories.length === 0 && (
          <p className="empty">Không tìm thấy danh mục.</p>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
      {isFormOpen && (
        <FormModal
          title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
          onClose={closeForm}
        >
          <form onSubmit={handleSave}>
            <label>
              Tên danh mục
              <input
                autoFocus
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <FieldError value={errors.name} />
            <label>
              Mô tả
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <FieldError value={errors.description} />
            <label className="check">
              <input
                type="checkbox"
                checked={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.checked })
                }
              />{" "}
              Đang hoạt động
            </label>
            <div className="form-actions">
              <button type="button" onClick={closeForm}>
                Hủy
              </button>
              <button className="primary">Lưu danh mục</button>
            </div>
          </form>
        </FormModal>
      )}
    </section>
  );
}
