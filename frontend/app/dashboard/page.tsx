// // 'use client'
// // import {useState} from 'react'
// // const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api';
// // // fetch(`${API}/deploy`, ...)
// // export default function Dashboard(){ const [since,setSince]=useState(''); const [res,setRes]=useState<any>(null); const run=async()=>{const r=await fetch(`${API}/logs/analyze`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(since?{since}:{})}); setRes(await r.json())}; return (<div style={{maxWidth:960}}><h1>Dashboard</h1><input placeholder='2025-10-05T00:00:00Z' value={since} onChange={e=>setSince(e.target.value)} style={{width:'100%'}}/><div><button onClick={run}>Analyze</button></div>{res&&<pre style={{background:'#16161a',padding:12}}>{JSON.stringify(res,null,2)}</pre>}</div>) }

// 'use client'
// import { useState } from 'react'

// // 프록시 쓰는 현재 구조라면 기본값은 '/api'
// const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

// export default function Home() {
//   const [pubkey, setPubkey] = useState('')
//   const [homeIp, setHomeIp] = useState('')
//   const [projectId, setProjectId] = useState('sesac-effi3elov3')
//   const [projectName, setProjectName] = useState('knu-effi3elov3')
//   const [region, setRegion] = useState('asia-northeast3')
//   const [zone, setZone] = useState('asia-northeast3-a')
//   const [machine, setMachine] = useState('e2-micro')
//   const [status, setStatus] = useState('')

//   const detectIp = async () => {
//     try {
//       const r = await fetch('https://api.ipify.org?format=json')
//       const j = await r.json()
//       setHomeIp(j.ip ?? '')
//     } catch (e) {
//       setStatus('IP detect failed')
//     }
//   }

//   const deploy = async () => {
//     setStatus('Deploying...')
//     try {
//       const body = {
//         project_id: projectId,
//         region,
//         zone,
//         project_name: projectName,
//         home_cidr: homeIp.includes('/') ? homeIp : `${homeIp}/32`,
//         ssh_username: 'ubuntu',
//         public_key: pubkey,
//         machine_type: machine,
//         set_root_password: false,
//         root_password: '',
//         enable_cloud_logging: true,
//       }
//       const r = await fetch(`${API}/deploy`, {
//         method: 'POST',
//         headers: { 'content-type': 'application/json' },
//         body: JSON.stringify(body),
//       })
//       const j = await r.json()
//       setStatus(JSON.stringify(j, null, 2))
//     } catch (e: any) {
//       setStatus(`Error: ${e?.message ?? String(e)}`)
//     }
//   }

//   return (
//     <div style={{ maxWidth: 960 }}>
//       <h1>Deploy</h1>
//       <pre>ssh-keygen -t ed25519 -C "stiletto" -f ~/.ssh/stiletto</pre>

//       <textarea value={pubkey} onChange={e => setPubkey(e.target.value)} rows={6} style={{ width: '100%' }} />

//       <div>
//         <label>현재 IP</label>
//         <input value={homeIp} onChange={e => setHomeIp(e.target.value)} />
//         <button onClick={detectIp}>Detect</button>
//       </div>

//       <div>
//         <input value={projectId} onChange={e => setProjectId(e.target.value)} />
//         <input value={projectName} onChange={e => setProjectName(e.target.value)} />
//         <input value={region} onChange={e => setRegion(e.target.value)} />
//         <input value={zone} onChange={e => setZone(e.target.value)} />
//         <input value={machine} onChange={e => setMachine(e.target.value)} />
//       </div>

//       <button onClick={deploy}>Deploy</button>

//       <div>
//         <b>Status:</b>
//         <pre>{status}</pre>
//       </div>
//     </div>
//   )
// }


'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

export default function Dashboard() {
  const [useAi, setUseAi] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const analyzeLogs = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/logs/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ use_ai: useAi })
      })
      const data = await r.json()
      setResult(data)
    } catch (e) {
      alert('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Log Intelligence</h1>
          <p className="text-gray-400">VM 로그 수집 및 Gemini 기반 보안 분석</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-surface px-4 py-2 rounded-lg border border-white/10 select-none">
            <input type="checkbox" checked={useAi} onChange={e => setUseAi(e.target.checked)} className="accent-primary w-4 h-4" />
            <span className="text-sm font-medium">Enable Gemini AI</span>
          </label>
          <button 
            onClick={analyzeLogs}
            disabled={loading}
            className={`font-bold px-6 py-2 rounded-lg transition-colors ${loading ? 'bg-gray-600 text-gray-300' : 'bg-primary hover:bg-emerald-400 text-black'}`}
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 통계 카드 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface p-6 rounded-xl border border-white/5">
              <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Traffic Stats</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span>Total Logs</span>
                  <span className="font-mono text-primary text-lg">{result.stats.total}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span>Web Requests</span>
                  <span className="font-mono text-blue-400 text-lg">{result.stats.nginx_hits}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span>SSH Success</span>
                  <span className="font-mono text-green-400 text-lg">{result.stats.ssh_accepted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SSH Failed</span>
                  <span className="font-mono text-red-400 text-lg">{result.stats.ssh_failed}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-white/5 max-h-96 overflow-hidden flex flex-col">
              <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Raw Logs (Sample)</h3>
              <div className="text-xs font-mono text-gray-500 overflow-auto space-y-2 pr-2">
                {result.raw_logs_sample.length > 0 ? (
                  result.raw_logs_sample.map((l: string, i: number) => (
                    <div key={i} className="border-b border-white/5 pb-1 last:border-0">{l}</div>
                  ))
                ) : (
                  <div>No logs found.</div>
                )}
              </div>
            </div>
          </div>

          {/* AI 분석 결과 */}
          <div className="lg:col-span-2">
            <div className="bg-surface p-8 rounded-xl border border-white/5 h-full min-h-[500px]">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                ✨ Gemini Security Report
              </h3>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{result.ai_report}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}