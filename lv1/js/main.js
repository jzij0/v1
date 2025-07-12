let expState = { login: false, watch: false, share: false, fengji: false };
function toggleExp(type) {
    expState[type] = !expState[type];
    const btn = document.getElementById(type+'Btn');
    btn.classList.toggle('active', expState[type]);
    // 动态插入/移除对勾
    let check = btn.querySelector('.fa.checked');
    if (expState[type]) {
        if (!check) {
            check = document.createElement('i');
            check.className = 'fa fa-check checked';
            btn.appendChild(check);
        }
    } else {
        if (check) btn.removeChild(check);
    }
}
window.onload = function() {
    // 设置大会员有效期最小日期为今天
    const vipDateInput = document.getElementById('vipDate');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    vipDateInput.setAttribute('min', todayStr);
    ["login","watch","share","fengji"].forEach(type => {
        const btn = document.getElementById(type+"Btn");
        btn.classList.remove('active');
        let check = btn.querySelector('.fa.checked');
        if (check) btn.removeChild(check);
    });
    calcDays();
}
function calcDays() {
    const login = expState.login ? 5 : 0;
    const watch = expState.watch ? 5 : 0;
    const share = expState.share ? 5 : 0;
    let coinPerDay = Number(document.getElementById('coinPerDay').value);
    if (isNaN(coinPerDay) || coinPerDay < 0) {
        coinPerDay = 0;
    }
    let myCoin = Number(document.getElementById('myCoin').value)||0;
    const curExp = Number(document.getElementById('curExp').value)||0;
    const lv6Exp = 28800;
    let fengjiCoinPerDay = expState.fengji ? 1 : 0;
    let days = 0;
    if (Number(document.getElementById('coinPerDay').value) < 0 && login + watch + share === 0) {
        days = '∞';
    } else {
        let exp = curExp;
        let coin = myCoin;
        let day = 0;
        while (exp < lv6Exp && day < 9999) {
            coin += 1; // 每天登录送1硬币
            if (expState.fengji && day % 30 === 0) coin += 30; // 风纪奖励每30天+30硬币
            let todayCoin = Math.min(coinPerDay, 5, coin);
            exp += login + watch + share + todayCoin*10;
            coin -= todayCoin;
            day++;
        }
        days = exp >= lv6Exp ? day : '∞';
    }
    let result = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">'
        +'<span style="font-size:22px;">剩余天数</span>'
        +'<span style="font-size:40px;font-weight:bold;">'+days+'</span>'
        +'</div>';
    // 读取大会员有效期
    const vipDateStr = document.getElementById('vipDate').value.trim();
    let vipMsg = '';
    if (vipDateStr) {
        // 只允许格式为 yyyy-mm-dd
        const match = vipDateStr.match(/^\d{4}-\d{2}-\d{2}$/);
        if (match) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const vipDate = new Date(vipDateStr);
            vipDate.setHours(0,0,0,0);
            const diff = Math.ceil((vipDate - today) / (1000*60*60*24));
            if (!isNaN(diff)) {
                if (diff >= 0) {
                    vipMsg = `<div style='font-size:15px;color:#888;margin-top:8px;'>大会员剩余 <strong>${diff}</strong> 天</div>`;
                } else {
                    vipMsg = `<div style='font-size:15px;color:#e67c7c;margin-top:8px;'>日期不能早于今天</div>`;
                }
            }
        } else {
            vipMsg = `<div style='font-size:15px;color:#e67c7c;margin-top:8px;'>日期格式应为 2026-05-12</div>`;
        }
    }
    document.getElementById('daysResult').style.display = 'block';
    document.getElementById('daysResult').innerHTML = result + vipMsg;
}
window.onload = calcDays;
