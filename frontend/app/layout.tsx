// export default function RootLayout({children}:{children:React.ReactNode}){
//   return (<html lang='en'><body style={{fontFamily:'ui-sans-serif',padding:20,background:'#0b0b0d',color:'#e6e6e9'}}>
//     <div style={{display:'flex',gap:16,marginBottom:24}}>
//       <a href='/' style={{color:'#9ae6b4'}}>Deploy</a>
//       <a href='/dashboard' style={{color:'#9ae6b4'}}>Dashboard</a>
//     </div>
//     {children}
//   </body></html>)
// }

import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif', padding: 20, background: '#0a0a0a', color: '#eaeaea' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <a href="/" style={{ color: '#9ae6b4' }}>Deploy</a>
          <a href="/dashboard" style={{ color: '#9ae6b4' }}>Dashboard</a>
        </div>
        {children}
      </body>
    </html>
  )
}
