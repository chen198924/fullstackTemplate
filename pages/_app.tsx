import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next';
import Router from 'next/router';
//Nprogress 配置css和包引入
import 'nprogress/nprogress.css'
import NProgress from 'nprogress'

const App = ({ Component, pageProps, router }: AppProps) => {

  Router.events.on('routeChangeStart', (...args) => {
    NProgress.start()
  })
  Router.events.on('routeChangeComplete', (...args) => {
    NProgress.done()
  })

  return <Component {...pageProps} />
}

export default appWithTranslation(App) 