import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCategories } from "../api/categories";
import { deleteProduct, getProducts, saveProduct } from "../api/products";
import { FieldError, FormModal } from "../components/FormModal";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import type {
  ApiError,
  Category,
  PaginationMeta,
  Product,
  StatusFilter,
} from "../types/catalog";

type ProductForm = {
  category_id: string;
  name: string;
  sku: string;
  description: string;
  price: string;
  stock: string;
  image: string;
  status: boolean;
};

const emptyForm: ProductForm = {
  category_id: "",
  name: "",
  sku: "",
  description: "",
  price: "",
  stock: "0",
  image: "",
  status: true,
};

const formatPrice = (value: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));

export function ProductsPage({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    void getCategories({ search: "", status: "all", page: 1, perPage: 50 })
      .then((response) => setCategories(response.data))
      .catch(() => notify("Không thể tải danh sách danh mục."));
  }, [notify]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProducts({ search, categoryId, status, page });
      setProducts(response.data);
      setMeta(response.meta);
    } catch (error) {
      notify(
        error instanceof globalThis.Error
          ? error.message
          : "Không thể tải sản phẩm.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, notify, page, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadProducts(), 300);
    return () => window.clearTimeout(timeout);
  }, [loadProducts]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setErrors({});
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      category_id: categories[0] ? String(categories[0].id) : "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      category_id: String(product.category_id),
      name: product.name,
      sku: product.sku,
      description: product.description ?? "",
      price: product.price,
      stock: String(product.stock),
      image: product.image ?? "",
      status: product.status,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await saveProduct(
        {
          ...form,
          category_id: Number(form.category_id),
          price: Number(form.price),
          stock: Number(form.stock),
          image: form.image || null,
        },
        editingProduct?.id,
      );
      notify(editingProduct ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm.");
      closeForm();
      await loadProducts();
    } catch (error) {
      const apiError = error as ApiError;
      setErrors(apiError.fields ?? {});
      notify(apiError.message);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm “${product.name}”?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      notify("Đã xóa sản phẩm.");
      await loadProducts();
    } catch (error) {
      notify(
        error instanceof globalThis.Error
          ? error.message
          : "Không thể xóa sản phẩm.",
      );
    }
  };

  return (
    <section>
      <header>
        <div>
          <p>Sản phẩm</p>
          <h1>Quản lý sản phẩm</h1>
        </div>
        <button type="button" className="primary" onClick={openCreateForm}>
          + Thêm sản phẩm
        </button>
      </header>
      <div className="filters">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Tìm tên, SKU hoặc mô tả…"
        />
        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          aria-label="Lọc danh mục"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as StatusFilter);
            setPage(1);
          }}
          aria-label="Lọc trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="1">Đang bán</option>
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
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <small>
                      {product.sku} · {product.description || "Chưa có mô tả"}
                    </small>
                  </td>
                  <td>{product.category?.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <StatusBadge active={product.status} />
                  </td>
                  <td className="actions">
                    <button type="button" onClick={() => openEditForm(product)}>
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void handleDelete(product)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && products.length === 0 && (
          <p className="empty">Không tìm thấy sản phẩm.</p>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
      {isFormOpen && (
        <FormModal
          title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          onClose={closeForm}
        >
          <form onSubmit={handleSave}>
            <div className="grid">
              <label>
                Danh mục
                <select
                  value={form.category_id}
                  onChange={(event) =>
                    setForm({ ...form, category_id: event.target.value })
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError value={errors.category_id} />
              </label>
              <label>
                SKU
                <input
                  value={form.sku}
                  onChange={(event) =>
                    setForm({ ...form, sku: event.target.value })
                  }
                />
                <FieldError value={errors.sku} />
              </label>
            </div>
            <label>
              Tên sản phẩm
              <input
                autoFocus
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
              <FieldError value={errors.name} />
            </label>
            <div className="grid">
              <label>
                Giá bán
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />
                <FieldError value={errors.price} />
              </label>
              <label>
                Tồn kho
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({ ...form, stock: event.target.value })
                  }
                />
                <FieldError value={errors.stock} />
              </label>
            </div>
            <label>
              Link ảnh
              <input
                type="url"
                value={form.image}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.value })
                }
              />
              <FieldError value={errors.image} />
            </label>
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
              Đang bán
            </label>
            <div className="form-actions">
              <button type="button" onClick={closeForm}>
                Hủy
              </button>
              <button className="primary">Lưu sản phẩm</button>
            </div>
          </form>
        </FormModal>
      )}
    </section>
  );
}
