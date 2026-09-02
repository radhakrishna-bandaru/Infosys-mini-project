function sfRenderNotifications(){
  const list = getNotifications();
  const wrap = document.getElementById("notif-list");
  if (!list.length){
    wrap.innerHTML = `<div class="card" style="text-align:center;padding:50px;"><div style="font-size:34px;">🔔</div><p class="text-muted mt-16">You're all caught up.</p></div>`;
    return;
  }
  wrap.innerHTML = list.map(n=>`
    <div class="card ${n.read?'':'shadow-card'}" style="border-color:${n.read?'var(--paper-200)':'var(--forest-500)'};display:flex;gap:14px;align-items:flex-start;">
      <span style="font-size:22px;">${n.icon}</span>
      <div style="flex:1;">
        <div class="flex-between">
          <strong style="font-size:15px;">${n.title}</strong>
          ${!n.read ? '<span class="badge badge-red">New</span>' : ''}
        </div>
        <p class="text-sm text-muted mt-8">${n.body}</p>
        <div class="text-sm text-muted mt-8">${n.time}</div>
      </div>
    </div>`).join("");
}

function sfInitNotifications(){
  sfRenderNotifications();
  document.getElementById("mark-all-read-btn").addEventListener("click", ()=>{
    markAllNotificationsRead();
    sfToast("All notifications marked as read");
    sfRenderNotifications();
  });
}
