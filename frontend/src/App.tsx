import { useCallback, useState } from 'react'
import { CategoriesPage } from './pages/CategoriesPage'
import { ProductsPage } from './pages/ProductsPage'
import './App.css'

type PageName = 'products' | 'categories'

function App() {
  const [page, setPage] = useState<PageName>('products')
  const [notice, setNotice] = useState('')

  const notify = useCallback((message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }, [])

  return (
    <div className="app">
      <aside>
        <div className="brand">StoreDesk<small>Quản trị cửa hàng</small></div>
        <button type="button" className={page === 'products' ? 'selected' : ''} onClick={() => setPage('products')}>▣ Sản phẩm</button>
        <button type="button" className={page === 'categories' ? 'selected' : ''} onClick={() => setPage('categories')}>◇ Danh mục</button>
      </aside>
      <main>{page === 'products' ? <ProductsPage notify={notify} /> : <CategoriesPage notify={notify} />}</main>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}

export default App
