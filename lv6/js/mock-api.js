// mock-api.js
(function() {
  // 拦截 fetch
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    // /api/upgrade-detail
    if (typeof input === 'string' && input.includes('/api/upgrade-detail')) {
      const body = JSON.parse(init && init.body ? init.body : '{}');
      const levelExpMap = { LV1: 0, LV2: 200, LV3: 1500, LV4: 4500, LV5: 10800, LV6: 28800 };
      const currentExp = Number(body.currentExp) || 0;
      const targetLevel = body.targetLevel || 'LV6';
      const coins = Number(body.coins) || 0;
      const isVip = !!body.isVip;
      const targetExp = levelExpMap[targetLevel] || 28800;
      const remainExp = Math.max(0, targetExp - currentExp);
      let currentLevel = 'LV0';
      if (currentExp >= 28800) currentLevel = 'LV6';
      else if (currentExp >= 10800) currentLevel = 'LV5';
      else if (currentExp >= 4500) currentLevel = 'LV4';
      else if (currentExp >= 1500) currentLevel = 'LV3';
      else if (currentExp >= 200) currentLevel = 'LV2';
      else if (currentExp >= 100) currentLevel = 'LV1';
      // 经验计算
      let totalExp = currentExp;
      let remainCoins = coins;
      let days = 0;
      let phase1Days = 0;
      let phase2Days = 0;
      while (remainCoins > 0 && totalExp < targetExp) {
        const use = Math.min(remainCoins, 4);
        const totalUse = use + 1;
        remainCoins -= use;
        const dayExp = 15 + (isVip ? 10 : 0) + totalUse * 10;
        totalExp += dayExp;
        days++;
        phase1Days++;
      }
      while (totalExp < targetExp && days < 9999) {
        const use = 1;
        const dayExp = 15 + (isVip ? 10 : 0) + use * 10;
        totalExp += dayExp;
        days++;
        phase2Days++;
      }
      return Promise.resolve(new Response(JSON.stringify({
        currentLevel,
        targetLevel,
        remainingExp: remainExp,
        daysNeeded: days,
        coinAvailableDays: phase1Days,
        phase2Days
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    // /api/user-uid
    if (typeof input === 'string' && input.includes('/api/user-uid')) {
      const body = JSON.parse(init && init.body ? init.body : '{}');
      const uid = body.uid || '';
      let valid = false;
      let message = '';
      if (!/^\d+$/.test(uid)) {
        message = 'UID只能包含数字。';
      } else if (uid.length > 16) {
        message = 'UID已超过最大长度，请检查输入。';
      } else if (uid.length === 16) {
        const validPrefixes = ['3461', '3493', '3494', '3537', '3546'];
        const prefix = uid.slice(0, 4);
        if (!validPrefixes.includes(prefix)) {
          message = '当前仅支持3461、3493、3494、3537、3546开头的16位UID，其它前缀暂不支持。';
        } else {
          valid = true;
          message = 'UID校验通过。';
        }
      } else {
        valid = true;
        message = 'UID校验通过。';
      }
      return Promise.resolve(new Response(JSON.stringify({ valid, message }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    // /api/coin-calc
    if (typeof input === 'string' && input.includes('/api/coin-calc')) {
      const body = JSON.parse(init && init.body ? init.body : '{}');
      const levelExpMap = { LV1: 0, LV2: 200, LV3: 1500, LV4: 4500, LV5: 10800, LV6: 28800 };
      const coins = Number(body.coins) || 0;
      const currentExp = Number(body.currentExp) || 0;
      const targetLevel = body.targetLevel || 'LV6';
      const isVip = !!body.isVip;
      const targetExp = levelExpMap[targetLevel] || 28800;
      const remainExp = Math.max(0, targetExp - currentExp);
      let totalExp = currentExp;
      let remainCoins = coins;
      let days = 0;
      let phase1Days = 0;
      let phase2Days = 0;
      while (remainCoins > 0 && totalExp < targetExp) {
        const use = Math.min(remainCoins, 4);
        const totalUse = use + 1;
        remainCoins -= use;
        const dayExp = 15 + (isVip ? 10 : 0) + totalUse * 10;
        totalExp += dayExp;
        days++;
        phase1Days++;
      }
      while (totalExp < targetExp && days < 9999) {
        const use = 1;
        const dayExp = 15 + (isVip ? 10 : 0) + use * 10;
        totalExp += dayExp;
        days++;
        phase2Days++;
      }
      return Promise.resolve(new Response(JSON.stringify({
        remainExp,
        daysNeeded: days,
        phase1Days,
        phase2Days
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    // /api/vip-expiry
    if (typeof input === 'string' && input.includes('/api/vip-expiry')) {
      const body = JSON.parse(init && init.body ? init.body : '{}');
      const vipExpiry = body.vipExpiry || '';
      let daysLeft = null;
      let status = 'invalid';
      let message = '';
      if (vipExpiry) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const expiryDate = new Date(vipExpiry);
        expiryDate.setHours(0, 0, 0, 0);
        const diff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        if (!isNaN(diff)) {
          daysLeft = diff;
          if (diff < 0) {
            status = 'expired';
            message = '大会员已到期';
          } else {
            status = 'active';
            message = `大会员剩余${diff}天`;
          }
        } else {
          message = '日期格式无效';
        }
      } else {
        message = '未填写到期日期';
      }
      return Promise.resolve(new Response(JSON.stringify({ daysLeft, status, message }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    // /api/daily-exp
    if (typeof input === 'string' && input.includes('/api/daily-exp')) {
      const body = JSON.parse(init && init.body ? init.body : '{}');
      const levelExpMap = { LV1: 0, LV2: 200, LV3: 1500, LV4: 4500, LV5: 10800, LV6: 28800 };
      const coins = Number(body.coins) || 0;
      const currentExp = Number(body.currentExp) || 0;
      const targetLevel = body.targetLevel || 'LV6';
      const isVip = !!body.isVip;
      const vipExpiry = body.vipExpiry || '';
      const targetExp = levelExpMap[targetLevel] || 28800;
      const remainExp = Math.max(0, targetExp - currentExp);
      // 满级判断，直接返回 message 字段，detail/extraDetail 置空
      if (currentExp >= targetExp || currentExp >= 28800) {
        return Promise.resolve(new Response(JSON.stringify({
          detail: '',
          extraDetail: '',
          message: '你已满级，无需再升级或投币。'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      // 经验变量
      const dailyCoinMax = 5;
      const dailyBaseExp = 15;
      const dailyVipExp = isVip ? 10 : 0;
      const dailyCoinExp = 10;
      // 用模拟循环统一统计天数
      let totalExp = currentExp;
      let remainCoins = coins;
      let days = 0;
      let phase1Days = 0;
      let phase2Days = 0;
      let dailyDetail = [];
      // 阶段1：有硬币时每天最多用4个自有+1个系统
      while (remainCoins > 0 && totalExp < targetExp) {
        const use = Math.min(remainCoins, 4);
        const totalUse = use + 1; // 系统赠送1个
        remainCoins -= use;
        const dayExp = dailyBaseExp + dailyVipExp + totalUse * dailyCoinExp;
        totalExp += dayExp;
        days++;
        phase1Days++;
        dailyDetail.push({ day: days, exp: dayExp, coinsUsed: totalUse, phase: 1, totalExp });
      }
      // 阶段2：无自有硬币后，每天只能用1个系统赠送
      while (totalExp < targetExp && days < 9999) {
        const use = 1;
        const dayExp = dailyBaseExp + dailyVipExp + use * dailyCoinExp;
        totalExp += dayExp;
        days++;
        phase2Days++;
        dailyDetail.push({ day: days, exp: dayExp, coinsUsed: use, phase: 2, totalExp });
      }
      // 生成详情
      let vipText = '';
      if (isVip && vipExpiry) {
        vipText = `<span style='color:#168aff;font-weight:bold;'>大会员有效期：${vipExpiry}</span><br>`;
      } else if (isVip) {
        vipText = `<span style='color:#168aff;font-weight:bold;'>大会员有效期：未填写</span><br>`;
      }
      let detail = '';
      detail += '<div style="background:#f6faff;border-radius:12px;padding:18px 18px 12px 18px;box-shadow:0 2px 10px #eaf2fa;line-height:2;font-size:14.5px;">';
      detail += '<div style="margin-bottom:10px;">'
        + '📊 <span style="color:#888;">剩余经验：</span><span style="color:#e67e22;font-weight:bold;font-size:18px;">' + remainExp + '</span>'
        + '</div>';
      detail += '<div style="margin-bottom:10px;">'
        + '⏳ <span style="color:#888;">总计预计还需</span> <span style="color:#168aff;font-weight:bold;font-size:22px;">' + days + '</span> <span style="color:#888;">天完成升级</span>'
        + '</div>';
      detail += '<div style="margin-bottom:10px;">'
        + '<span style="display:inline-block;background:#eafaf1;color:#27ae60;border-radius:16px;padding:2px 12px 2px 8px;margin-right:8px;font-size:13px;vertical-align:middle;">'
        + '🟢 阶段1：<b>' + phase1Days + '</b>天'
        + '</span>'
        + '<span style="display:inline-block;background:#fff0f0;color:#c0392b;border-radius:16px;padding:2px 12px 2px 8px;font-size:13px;vertical-align:middle;">'
        + '🔴 阶段2：<b>' + phase2Days + '</b>天'
        + '</span>'
        + '</div>';
      detail += '<div style="margin:12px 0 10px 0;border-top:1.5px dashed #e0e0e0;"></div>';
      detail += '<div style="margin-bottom:10px;">'
        + '🎯 <span style="color:#888;">升级后总经验：</span><span style="color:#e67e22;font-weight:bold;">' + totalExp + '</span>'
        + '</div>';
      detail += vipText;
      detail += '</div>';
      if (dailyDetail.length > 0) {
        detail += '<br><b style="font-size:15px;">每日经验详情：</b><br>';
        detail += '<div style="max-height:180px;overflow:auto;border:1px solid #e0e6ef;padding:6px 8px 6px 8px;margin-top:4px;background:#fafdff;border-radius:10px 10px 14px 14px;box-shadow:0 1px 6px #f0f4fa;">';
        detail += '<table style="width:100%;font-size:13px;border-collapse:separate;border-spacing:0 2px;">';
        detail += '<tr style="background:#eaf2fa;color:#168aff;font-weight:bold;">' +
          '<th style="border-bottom:2px solid #d0e2f6;padding:4px 0;border-radius:6px 0 0 0;">天数</th>' +
          '<th style="border-bottom:2px solid #d0e2f6;padding:4px 0;">经验</th>' +
          '<th style="border-bottom:2px solid #d0e2f6;padding:4px 0;">消耗硬币</th>' +
          '<th style="border-bottom:2px solid #d0e2f6;padding:4px 0;">阶段</th>' +
          '<th style="border-bottom:2px solid #d0e2f6;padding:4px 0;border-radius:0 6px 0 0;">累计经验</th>' +
          '</tr>';
        dailyDetail.forEach(function(row, idx) {
          detail += '<tr style="background:' + (idx%2===0?'#fff':'#f6fafd') + ';transition:background 0.2s;">' +
            '<td style="text-align:center;border-bottom:1px solid #f2f2f2;color:#168aff;font-weight:bold;">' + row.day + '</td>' +
            '<td style="text-align:center;border-bottom:1px solid #f2f2f2;">' + row.exp + '</td>' +
            '<td style="text-align:center;border-bottom:1px solid #f2f2f2;">' + row.coinsUsed + '</td>' +
            '<td style="text-align:center;border-bottom:1px solid #f2f2f2;">' + (row.phase === 1 ? '<span style="color:#27ae60;">硬币足够</span>' : '<span style="color:#c0392b;">硬币不足</span>') + '</td>' +
            '<td style="text-align:center;border-bottom:1px solid #f2f2f2;">' + row.totalExp + '</td>' +
            '</tr>';
        });
        detail += '</table></div>';
      }
      let extraDetail = '';
      extraDetail += '<div class="card p-4 mb-3 shadow-sm border-0" style="font-size:15px;">';
      // 优化大会员有效期显示逻辑
      let showVip = false;
      let vipDateStr = '';
      if (isVip && vipExpiry) {
        // 解析日期，支持 25-06-23/25-6-23/2025-06-23 等
        let dateStr = vipExpiry.replace(/\//g, '-');
        let parts = dateStr.split('-');
        let year = parts[0].length === 2 ? ('20' + parts[0]) : parts[0];
        let month = parts[1].padStart(2, '0');
        let day = parts[2].padStart(2, '0');
        let dateObj = new Date(`${year}-${month}-${day}`);
        let today = new Date();
        today.setHours(0,0,0,0);
        dateObj.setHours(0,0,0,0);
        if (!isNaN(dateObj.getTime()) && dateObj >= today) {
          showVip = true;
          vipDateStr = `${year.slice(2)}-${month}-${day}`;
        }
      }
      if (showVip) {
        extraDetail += '<div class="d-flex align-items-center mb-2">'
          + '<span class="me-2" style="font-size:16px;">👑</span>'
          + '<span class="fw-bold text-primary">大会员有效期：</span>'
          + '<span class="fw-bold text-primary" style="font-size:17px;">' + vipDateStr + '</span>'
          + '</div>';
      }
      if (phase1Days > 0) {
        extraDetail += '<div class="d-flex align-items-center mb-2">'
          + '<span class="me-2" style="font-size:16px;">🪙</span>'
          + '<span>当前硬币数量可用天数约: </span>'
          + '<span class="fw-bold text-warning mx-1" style="font-size:17px;">' + phase1Days + '</span>'
          + '<span>天</span>'
          + '<span class="text-muted ms-2 small">（每天最多用5个硬币，其中1个为每日登录获取）</span>'
          + '</div>';
      }
      if (phase2Days > 0) {
        extraDetail += '<div class="d-flex align-items-center mb-2">'
          + '<span class="me-2" style="font-size:16px;">🕒</span>'
          + '<span>后续硬币不足，每天只能用1个，预计还需 </span>'
          + '<span class="fw-bold text-warning mx-1" style="font-size:17px;">' + phase2Days + '</span>'
          + '<span>天</span>'
          + '</div>';
      }
      if (typeof needCoinsForFullExp !== 'undefined' && needCoinsForFullExp > 0) {
        extraDetail += '<div class="d-flex align-items-center mb-2">'
          + '<span class="me-2" style="font-size:16px;">💰</span>'
          + '<span>如想后续每天继续获得';
        if (typeof vipDays !== 'undefined' && vipDays > 0) {
          extraDetail += '前' + vipDays + '天为75经验，后续为65经验';
        } else {
          extraDetail += '65经验';
        }
        extraDetail += '，还需 <span class="fw-bold text-warning mx-1" style="font-size:17px;">' + needCoinsForFullExp + '</span> 个硬币'
          + '</span>'
          + '</div>';
      }
      extraDetail += '<div class="d-flex align-items-center mb-2">'
        + '<span class="me-2" style="font-size:16px;">📅</span>'
        + '<span>总计预计还需 </span>'
        + '<span class="fw-bold text-primary mx-1" style="font-size:17px;">' + days + '</span>'
        + '<span>天完成升级</span>'
        + '</div>';
      extraDetail += '<div class="d-flex align-items-center">'
        + '<span class="me-2" style="font-size:16px;">⭐</span>'
        + '<span>每日经验: </span>'
        + '<span class="fw-bold text-warning mx-1" style="font-size:17px;">' + (15 + (isVip ? 10 : 0) + 1 * 10) + '</span>'
        + '<span class="text-muted ms-2 small">（硬币不足时，每日登录获取1个硬币）</span>'
        + '</div>';
      extraDetail += '</div>';
      return Promise.resolve(new Response(JSON.stringify({
        detail,
        extraDetail
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    // 其他请求走原生 fetch
    return originalFetch.apply(this, arguments);
  };
})();
