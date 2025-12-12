// // 'use client'
// // import {useState} from 'react'
// // const API=process.env.NEXT_PUBLIC_API_BASE||'http://localhost:8080'
// // export default function Home(){
// //  const [pubkey,setPubkey]=useState(''); const [homeIp,setHomeIp]=useState(''); const [projectId,setProjectId]=useState('sesac-effi3elov3'); const [projectName,setProjectName]=useState('knu-effi3elov3'); const [region,setRegion]=useState('asia-northeast3'); const [zone,setZone]=useState('asia-northeast3-a'); const [machineType,setMachineType]=useState('e2-micro'); const [sshUser,setSshUser]=useState('ubuntu'); const [rootEnabled,setRootEnabled]=useState(false); const [rootPassword,setRootPassword]=useState(''); const [status,setStatus]=useState(''); const [outputs,setOutputs]=useState<any>(null);
// //  const detectIp=async()=>{try{const r=await fetch('https://api.ipify.org?format=json'); const d=await r.json(); setHomeIp(d.ip)}catch{alert('IP 탐지 실패')}};
// //  const deploy=async()=>{setStatus('Deploying...'); try{const r=await fetch(`${API}/deploy`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project_id:projectId,region,zone,project_name:projectName,home_cidr:`${homeIp}/32`,ssh_username:sshUser,public_key:pubkey,machine_type:machineType,set_root_password:rootEnabled,root_password:rootPassword,enable_cloud_logging:true})}); const d=await r.json(); setOutputs(d); setStatus('Done.')}catch(e:any){setStatus('Error: '+e.message)}};
// //  return (<div style={{maxWidth:960}}><h1>Deploy</h1><pre>ssh-keygen -t ed25519 -C "stiletto" -f ~/.ssh/stiletto</pre><textarea placeholder='ssh-ed25519 AAAA...' value={pubkey} onChange={e=>setPubkey(e.target.value)} style={{width:'100%',height:100}}/><h3>현재 IP</h3><div style={{display:'flex',gap:8}}><input placeholder='203.0.113.45' value={homeIp} onChange={e=>setHomeIp(e.target.value)}/><button onClick={detectIp}>Detect</button></div><h3>필수</h3><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><input value={projectId} onChange={e=>setProjectId(e.target.value)}/><input value={projectName} onChange={e=>setProjectName(e.target.value)}/><input value={region} onChange={e=>setRegion(e.target.value)}/><input value={zone} onChange={e=>setZone(e.target.value)}/><input value={sshUser} onChange={e=>setSshUser(e.target.value)}/><input value={machineType} onChange={e=>setMachineType(e.target.value)}/></div><details><summary>루트 옵션</summary><label><input type='checkbox' checked={rootEnabled} onChange={e=>setRootEnabled(e.target.checked)}/> set_root_password</label>{rootEnabled&&<input type='password' value={rootPassword} onChange={e=>setRootPassword(e.target.value)}/>}</details><div style={{marginTop:12}}><button onClick={deploy}>Deploy</button></div>{status&&<p>Status: {status}</p>}{outputs&&<pre style={{background:'#16161a',padding:12}}>{JSON.stringify(outputs,null,2)}</pre>}</div>) }

// 'use client'
// import { useState } from 'react'

// const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

// export default function DeployPage() {
//   const [formData, setFormData] = useState({
//     projectId: 'sesac-effi3elov3',
//     region: 'asia-northeast3',
//     zone: 'asia-northeast3-a',
//     projectName: 'knu-effi3elov3',
//     homeIp: '',
//     pubkey: '',
//     machineType: 'e2-micro',
//   })
//   const [status, setStatus] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   const handleChange = (e: any) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const detectIp = async () => {
//     try {
//       const r = await fetch('https://api.ipify.org?format=json')
//       const j = await r.json()
//       setFormData(prev => ({ ...prev, homeIp: j.ip }))
//     } catch {
//       setStatus('IP 탐지 실패')
//     }
//   }

//   const deploy = async () => {
//     setIsLoading(true)
//     setStatus('Deploying via Terraform...')
//     try {
//       const body = {
//         project_id: formData.projectId,
//         region: formData.region,
//         zone: formData.zone,
//         project_name: formData.projectName,
//         home_cidr: formData.homeIp.includes('/') ? formData.homeIp : `${formData.homeIp}/32`,
//         ssh_username: 'ubuntu',
//         public_key: formData.pubkey,
//         machine_type: formData.machineType,
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
//       setStatus(`Error: ${e?.message}`)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">VM Deployment</h1>
//           <p className="text-gray-400">GCP Redirector VM을 자동으로 배포합니다.</p>
//         </div>

//         <div className="bg-surface p-6 rounded-xl border border-white/5 space-y-4">
//           <h3 className="text-lg font-semibold text-primary">Configuration</h3>
          
//           <div className="grid grid-cols-2 gap-4">
//             <Input label="Project ID" name="projectId" value={formData.projectId} onChange={handleChange} />
//             <Input label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} />
//             <Input label="Region" name="region" value={formData.region} onChange={handleChange} />
//             <Input label="Zone" name="zone" value={formData.zone} onChange={handleChange} />
//           </div>

//           <Input label="Machine Type" name="machineType" value={formData.machineType} onChange={handleChange} />
          
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-gray-500 uppercase">Home IP (Access Allow)</label>
//             <div className="flex gap-2">
//               <input 
//                 className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 focus:border-primary outline-none transition-colors"
//                 name="homeIp" value={formData.homeIp} onChange={handleChange} placeholder="x.x.x.x" 
//               />
//               <button onClick={detectIp} className="bg-white/10 hover:bg-white/20 px-4 rounded text-sm transition-colors">
//                 Auto
//               </button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="text-xs font-bold text-gray-500 uppercase">SSH Public Key</label>
//             <textarea 
//               className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm font-mono h-24 focus:border-primary outline-none transition-colors resize-none"
//               name="pubkey" value={formData.pubkey} onChange={handleChange} placeholder="ssh-ed25519 AAAA..." 
//             />
//           </div>

//           <button 
//             onClick={deploy} 
//             disabled={isLoading}
//             className={`w-full py-3 rounded-lg font-bold text-black transition-all ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-emerald-400 shadow-lg shadow-primary/20'}`}
//           >
//             {isLoading ? 'Deploying...' : 'Start Deployment'}
//           </button>
//         </div>
//       </div>

//       <div className="space-y-6">
//         <h2 className="text-2xl font-bold">Deployment Logs</h2>
//         <div className="bg-black rounded-xl border border-white/10 p-4 h-[600px] overflow-auto font-mono text-sm text-green-400">
//           <pre className="whitespace-pre-wrap">{status || 'Ready to deploy...'}</pre>
//         </div>
//       </div>
//     </div>
//   )
// }

// function Input({ label, name, value, onChange }: any) {
//   return (
//     <div className="space-y-1">
//       <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
//       <input 
//         className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 focus:border-primary outline-none transition-colors"
//         name={name} value={value} onChange={onChange} 
//       />
//     </div>
//   )
// }


'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

export default function DeployPage() {
  const [formData, setFormData] = useState({
    projectId: 'sesac-effi3elov3',
    region: 'asia-northeast3',
    zone: 'asia-northeast3-a',
    projectName: 'knu-effi3elov3',
    homeIp: '',
    pubkey: '',
    machineType: 'e2-micro',
  })
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const detectIp = async () => {
    try {
      const r = await fetch('https://api.ipify.org?format=json')
      const j = await r.json()
      setFormData(prev => ({ ...prev, homeIp: j.ip }))
    } catch {
      setStatus('IP 탐지 실패')
    }
  }

  const deploy = async () => {
    setIsLoading(true)
    setStatus('Deploying via Terraform...')
    try {
      const body = {
        project_id: formData.projectId,
        region: formData.region,
        zone: formData.zone,
        project_name: formData.projectName,
        home_cidr: formData.homeIp.includes('/') ? formData.homeIp : `${formData.homeIp}/32`,
        ssh_username: 'ubuntu',
        public_key: formData.pubkey,
        machine_type: formData.machineType,
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
      setStatus(`Error: ${e?.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">VM Deployment</h1>
          <p className="text-gray-400">GCP Redirector VM을 자동으로 배포합니다.</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-lg font-semibold text-primary">Configuration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Project ID" name="projectId" value={formData.projectId} onChange={handleChange} />
            <Input label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} />
            <Input label="Region" name="region" value={formData.region} onChange={handleChange} />
            <Input label="Zone" name="zone" value={formData.zone} onChange={handleChange} />
          </div>

          <Input label="Machine Type" name="machineType" value={formData.machineType} onChange={handleChange} />
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Home IP (Access Allow)</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 focus:border-primary outline-none transition-colors"
                name="homeIp" value={formData.homeIp} onChange={handleChange} placeholder="x.x.x.x" 
              />
              <button onClick={detectIp} className="bg-white/10 hover:bg-white/20 px-4 rounded text-sm transition-colors">
                Auto
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">SSH Public Key</label>
            <textarea 
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm font-mono h-24 focus:border-primary outline-none transition-colors resize-none"
              name="pubkey" value={formData.pubkey} onChange={handleChange} placeholder="ssh-ed25519 AAAA..." 
            />
          </div>

          <button 
            onClick={deploy} 
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-black transition-all ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-emerald-400 shadow-lg shadow-primary/20'}`}
          >
            {isLoading ? 'Deploying...' : 'Start Deployment'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Deployment Logs</h2>
        <div className="bg-black rounded-xl border border-white/10 p-4 h-[600px] overflow-auto font-mono text-sm text-green-400">
          <pre className="whitespace-pre-wrap">{status || 'Ready to deploy...'}</pre>
        </div>
      </div>
    </div>
  )
}

function Input({ label, name, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <input 
        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 focus:border-primary outline-none transition-colors"
        name={name} value={value} onChange={onChange} 
      />
    </div>
  )
}