import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {httpBatchLink} from "@trpc/client/links/httpBatchLink"
import { AppRouter } from '../server/routes/app.route'
import { withTRPC } from '@trpc/next'
import superjson from "superjson"
import { url } from '../constants'
import {Provider} from "react-redux"
import store from "../redux/store"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
    )
}

export default withTRPC<AppRouter>({
  config({ctx}){
    const links = [
      httpBatchLink({
        maxBatchSize: 10,
        url
      })
    ]
    const ONE_DAY_SECONDS = 60 * 60 * 24;
    ctx?.res?.setHeader(
      'Cache-Control',
      `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`,
    );
    return {
      queryClientConfig: {
        defaultOptions:{
          queries:{
            staleTime: 60
          }
        },
      },
      header(){
        if(ctx?.req){
          return {...ctx.req.headers,'x-ssr': "1"}
        }
        return {}
      },
      links,
      transformer: superjson
    }
  }, 
  ssr: true
})(MyApp)

