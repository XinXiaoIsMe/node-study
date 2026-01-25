import './App.css'
import { useEffect, useMemo } from 'react'

function App() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('token')
  }, [])
  
  useEffect(() => {
    // 如果有token代表登录过了
    if (token)
      return
    
    // 如果没有跳转到 登录页面，并且地址栏携带AppID
    void fetch('http://localhost:3000/login?appId=9LQ8Y3mB').then((res) => {
      window.location.assign(res.url)
    })
  }, [token])

  return (
    <>
      <div>React Client</div>
    </>
  )
}

export default App
