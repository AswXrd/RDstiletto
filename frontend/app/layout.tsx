// // export default function RootLayout({children}:{children:React.ReactNode}){
// //   return (<html lang='en'><body style={{fontFamily:'ui-sans-serif',padding:20,background:'#0b0b0d',color:'#e6e6e9'}}>
// //     <div style={{display:'flex',gap:16,marginBottom:24}}>
// //       <a href='/' style={{color:'#9ae6b4'}}>Deploy</a>
// //       <a href='/dashboard' style={{color:'#9ae6b4'}}>Dashboard</a>
// //     </div>
// //     {children}
// //   </body></html>)
// // }

// // import type { ReactNode } from 'react'

// // export default function RootLayout({ children }: { children: ReactNode }) {
// //   return (
// //     <html lang="en">
// //       <body style={{ fontFamily: 'ui-sans-serif', padding: 20, background: '#0a0a0a', color: '#eaeaea' }}>
// //         <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
// //           <a href="/" style={{ color: '#9ae6b4' }}>Deploy</a>
// //           <a href="/dashboard" style={{ color: '#9ae6b4' }}>Dashboard</a>
// //         </div>
// //         {children}
// //       </body>
// //     </html>
// //   )
// // }

// import type { ReactNode } from 'react'
// import './globals.css' // 위에서 만든 CSS 임포트

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-background text-gray-100 font-sans antialiased">
//         <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
//           <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
//             <div className="font-bold text-xl tracking-tight text-primary">
//               Stiletto <span className="text-gray-500 font-normal">Manager</span>
//             </div>
//             <div className="flex gap-6 text-sm font-medium">
//               <a href="/" className="hover:text-primary transition-colors">Deploy</a>
//               <a href="/dashboard" className="hover:text-primary transition-colors">Log Analysis</a>
//             </div>
//           </div>
//         </nav>
//         <main className="max-w-5xl mx-auto px-6 py-10">
//           {children}
//         </main>
//       </body>
//     </html>
//   )
// }

import type { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-gray-100 font-sans antialiased">
        <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight text-primary">
              Stiletto <span className="text-gray-500 font-normal">Manager</span>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <a href="/" className="hover:text-primary transition-colors">Deploy</a>
              <a href="/dashboard" className="hover:text-primary transition-colors">Log Intelligence</a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}