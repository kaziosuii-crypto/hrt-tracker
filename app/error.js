'use client'
export default function Error({reset}){return <main className="app"><section className="empty" style={{margin:'18vh auto',maxWidth:540}}><small>HRT ATLAS / RECOVERY</small><b>页面暂时无法显示</b><span>当前栏目渲染时遇到问题。记录没有被修改，可以重新载入这一页。</span><button onClick={()=>reset()}>重新载入</button></section></main>}
