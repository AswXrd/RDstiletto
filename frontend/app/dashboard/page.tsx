// 'use client'
// import {useState} from 'react'
// const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api';
// // fetch(`${API}/deploy`, ...)
// export default function Dashboard(){ const [since,setSince]=useState(''); const [res,setRes]=useState<any>(null); const run=async()=>{const r=await fetch(`${API}/logs/analyze`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(since?{since}:{})}); setRes(await r.json())}; return (<div style={{maxWidth:960}}><h1>Dashboard</h1><input placeholder='2025-10-05T00:00:00Z' value={since} onChange={e=>setSince(e.target.value)} style={{width:'100%'}}/><div><button onClick={run}>Analyze</button></div>{res&&<pre style={{background:'#16161a',padding:12}}>{JSON.stringify(res,null,2)}</pre>}</div>) }

'use client'
import { useState } from 'react'

// 프록시 쓰는 현재 구조라면 기본값은 '/api'
const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

export default function Home() {
  const [pubkey, setPubkey] = useState('')
  const [homeIp, setHomeIp] = useState('')
  const [projectId, setProjectId] = useState('sesac-effi3elov3')
  const [projectName, setProjectName] = useState('knu-effi3elov3')
  const [region, setRegion] = useState('asia-northeast3')
  const [zone, setZone] = useState('asia-northeast3-a')
  const [machine, setMachine] = useState('e2-micro')
  const [status, setStatus] = useState('')

  const detectIp = async () => {
    try {
      const r = await fetch('https://api.ipify.org?format=json')
      const j = await r.json()
      setHomeIp(j.ip ?? '')
    } catch (e) {
      setStatus('IP detect failed')
    }
  }

  const deploy = async () => {
    setStatus('Deploying...')
    try {
      const body = {
        project_id: projectId,
        region,
        zone,
        project_name: projectName,
        home_cidr: homeIp.includes('/') ? homeIp : `${homeIp}/32`,
        ssh_username: 'ubuntu',
        public_key: pubkey,
        machine_type: machine,
        set_root_password: false,
        root_password: '',
        enable_cloud_logging: true,
      }
      const r = await fetch(`${API}/deploy`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await r.json()
      setStatus(JSON.stringify(j, null, 2))
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? String(e)}`)
    }
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <h1>Deploy</h1>
      <pre>ssh-keygen -t ed25519 -C "stiletto" -f ~/.ssh/stiletto</pre>

      <textarea value={pubkey} onChange={e => setPubkey(e.target.value)} rows={6} style={{ width: '100%' }} />

      <div>
        <label>현재 IP</label>
        <input value={homeIp} onChange={e => setHomeIp(e.target.value)} />
        <button onClick={detectIp}>Detect</button>
      </div>

      <div>
        <input value={projectId} onChange={e => setProjectId(e.target.value)} />
        <input value={projectName} onChange={e => setProjectName(e.target.value)} />
        <input value={region} onChange={e => setRegion(e.target.value)} />
        <input value={zone} onChange={e => setZone(e.target.value)} />
        <input value={machine} onChange={e => setMachine(e.target.value)} />
      </div>

      <button onClick={deploy}>Deploy</button>

      <div>
        <b>Status:</b>
        <pre>{status}</pre>
      </div>
    </div>
  )
}
