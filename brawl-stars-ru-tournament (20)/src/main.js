import { initializeApp as _0xiz } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore as _0xfs, doc as _0xdc, onSnapshot as _0xos, setDoc as _0xsd, getDocFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        const _0xfc = {
            apiKey: "AIzaSyCyRdc-b9BU3k3LzNz1_uiVBdpp67bDhLU",
            authDomain: "gen-lang-client-0349064699.firebaseapp.com",
            projectId: "gen-lang-client-0349064699",
            appId: "1:692977547959:web:0cd1190178a4ca0b94eb32",
            firestoreDatabaseId: "ai-studio-e3472b08-11a8-43ac-b477-3a47a972e431"
        };

        let _0xal = false;
        let _0xhl = false;

        const _0xapp = _0xiz(_0xfc);
        const _0xdb = _0xfs(_0xapp, _0xfc.firestoreDatabaseId);

        // --- UTILS MOVED UP ---
        window.getNextIndex = (idx, totalSlots) => {
            let offset = 0;
            let rSize = totalSlots / 2;
            while (rSize > 1) {
                if (idx >= offset && idx < offset + rSize) {
                    const nextOffset = offset + rSize;
                    return nextOffset + Math.floor((idx - offset) / 2);
                }
                offset += rSize;
                rSize /= 2;
            }
            return -1;
        };
        // --- END UTILS ---

        // Verify connection as per requirements
        async function checkConnection() {
            try {
                await getDocFromServer(_0xdc(_0xdb, 'tournament', 'data'));
            } catch (error) {
                if(error instanceof Error && error.message.includes('the client is offline')) {
                    console.error("Please check your Firebase configuration.");
                }
            }
        }
        checkConnection();

        let _0xtd = {
            currentMatch: { p1: "Скоро", p2: "Скоро", score: "0 : 0" },
            matches: [],
            schedule: [],
            timerEnd: null,
            participants: ""
        };

        _0xos(_0xdc(_0xdb, "tournament", "data"), (snap) => {
            if (snap.exists()) {
                _0xtd = snap.data();
                window._hostActiveMatches = _0xtd.activeMatches || [];
                window._hostScheduleMatches = _0xtd.scheduleMatches || [];
                window.renderTournament();
                if (window._discordUser) window.renderDiscordState();
                if (_0xal) window.renderAdminApplications();
            }
        });

        // Discord Auth State
        window._discordUser = JSON.parse(localStorage.getItem('discordUser')) || null;

        window.renderDiscordState = function() {
            const authReq = document.getElementById('register-auth-required');
            const formView = document.getElementById('register-form-view');
            
            if (authReq && formView) {
                if (window._discordUser) {
                    authReq.classList.add('hidden');
                    formView.classList.remove('hidden');
                    document.getElementById('discord-username').innerText = window._discordUser.username || "User";
                    if (window._discordUser.avatar && window._discordUser.id) {
                        const avatarEl = document.getElementById('discord-avatar');
                        avatarEl.src = `https://cdn.discordapp.com/avatars/${window._discordUser.id}/${window._discordUser.avatar}.png`;
                        avatarEl.classList.remove('hidden');
                        document.getElementById('discord-avatar-fallback').classList.add('hidden');
                    } else {
                        document.getElementById('discord-avatar').classList.add('hidden');
                        document.getElementById('discord-avatar-fallback').classList.remove('hidden');
                    }
                    
                    // Check if already applied or processed
                    const procApps = _0xtd?.processedApplications || [];
                    const isProcessed = procApps.includes(window._discordUser.id);
                    
                    const tNameInput = document.getElementById('reg-team-name');
                    const nicksInput = document.getElementById('reg-discord-nicks');
                    const bsIdsInput = document.getElementById('reg-bs-ids');
                    const btn = document.getElementById('btn-submit-app');
                    
                    if (isProcessed) {
                        if (btn) {
                            btn.innerText = "Заявка рассмотрена";
                            btn.disabled = true;
                            btn.classList.add('opacity-50', 'cursor-not-allowed');
                        }
                        tNameInput.disabled = true;  tNameInput.value = "Заявка рассмотрена";
                        nicksInput.disabled = true;  nicksInput.value = "";
                        bsIdsInput.disabled = true;  bsIdsInput.value = "";
                    } else {
                        if (btn) {
                            btn.disabled = false;
                            btn.classList.remove('opacity-50', 'cursor-not-allowed');
                        }
                        tNameInput.disabled = false;
                        nicksInput.disabled = false;
                        bsIdsInput.disabled = false;
                        
                        const apps = _0xtd?.applications || [];
                        const existingApp = apps.find(a => a.discordId === window._discordUser.id);
                        if (existingApp) {
                            tNameInput.value = existingApp.teamName;
                            nicksInput.value = existingApp.nicks;
                            bsIdsInput.value = existingApp.bsIds;
                            if (btn) btn.innerText = "Обновить заявку";
                        } else {
                            if (tNameInput.value === "Заявка рассмотрена") tNameInput.value = "";
                            if (btn) btn.innerText = "Отправить заявку";
                        }
                    }
                } else {
                    authReq.classList.remove('hidden');
                    formView.classList.add('hidden');
                }
            }
        };

        window.handleDiscordLogin = async function() {
            try {
                const clientId = _0xtd.discordClientId;
                if (!clientId) {
                    alert('Администратор еще не настроил Discord Client ID. Авторизация недоступна.');
                    return;
                }
                const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
                const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;
                
                const authWindow = window.open(url, 'discord_oauth_popup', 'width=600,height=700');
                if (!authWindow) {
                    alert('Пожалуйста, разрешите всплывающие окна для авторизации в Discord.');
                }
            } catch (err) {
                alert('Не удалось инициализировать авторизацию. ' + err.message);
            }
        };

        window.handleDiscordLogout = function() {
            window._discordUser = null;
            localStorage.removeItem('discordUser');
            window.renderDiscordState();
        };

        window.addEventListener('message', (event) => {
            if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
                window._discordUser = event.data.user;
                localStorage.setItem('discordUser', JSON.stringify(event.data.user));
                window.renderDiscordState();
            }
        });

        // Parse Discord Implicit Grant token if returning from OAuth
        if (window.location.hash.includes('access_token')) {
            const params = new URLSearchParams(window.location.hash.slice(1));
            const token = params.get('access_token');
            if (token) {
                document.body.innerHTML = '<h2 style="font-family:sans-serif; text-align:center; margin-top:20vh;">Авторизация успешна. Загрузка данных...</h2>';
                fetch('https://discord.com/api/users/@me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(userData => {
                    if (window.opener) {
                        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: userData }, '*');
                        window.close();
                    } else {
                        window._discordUser = userData;
                        localStorage.setItem('discordUser', JSON.stringify(userData));
                        window.location.hash = ''; // Clean URL
                        window.renderDiscordState();
                        window.showTab('register'); // Go to register tab if not a popup
                    }
                })
                .catch(err => {
                    console.error("Discord Auth Error:", err);
                    if(window.opener) window.close();
                });
            }
        }

        window.submitApplication = async function() {
            if (!window._discordUser) return;
            const tName = document.getElementById('reg-team-name').value.trim();
            const nicks = document.getElementById('reg-discord-nicks').value.trim();
            const ids = document.getElementById('reg-bs-ids').value.trim();
            
            const errEl = document.getElementById('reg-status-message');
            
            if (!tName || !nicks || !ids) {
                errEl.innerText = "Пожалуйста, заполните все поля.";
                errEl.className = "text-center py-2 font-bold text-sm text-red-500 block";
                return;
            }
            
            const btn = document.getElementById('btn-submit-app');
            btn.disabled = true;
            btn.innerText = "Отправка...";
            
            try {
                const apps = _0xtd.applications || [];
                const existIdx = apps.findIndex(a => a.discordId === window._discordUser.id);
                
                if (existIdx !== -1) {
                    apps[existIdx] = {
                        ...apps[existIdx],
                        teamName: tName,
                        nicks: nicks,
                        bsIds: ids,
                        timestamp: Date.now()
                    };
                } else {
                    const appId = Date.now().toString() + Math.floor(Math.random()*1000).toString();
                    apps.push({
                        id: appId,
                        discordId: window._discordUser.id,
                        discordUsername: window._discordUser.username,
                        teamName: tName,
                        nicks: nicks,
                        bsIds: ids,
                        timestamp: Date.now()
                    });
                }
                
                _0xtd.applications = apps;
                await _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
                
                errEl.innerText = existIdx !== -1 ? "Ваша заявка успешно обновлена!" : "Ваша заявка успешно отправлена!";
                errEl.className = "text-center py-2 font-bold text-sm text-green-500 block";
                
            } catch (err) {
                errEl.innerText = "Ошибка при отправке: " + err.message;
                errEl.className = "text-center py-2 font-bold text-sm text-red-500 block";
            } finally {
                btn.disabled = false;
                window.renderDiscordState();
                setTimeout(() => { if(errEl.innerText.includes("успешно")) errEl.className = "hidden"; }, 5000);
            }
        };

        window.renderAdminApplications = function() {
            const list = document.getElementById('admin-applications-list');
            if (!list) return;
            
            const apps = _0xtd.applications || [];
            if (apps.length === 0) {
                list.innerHTML = '<p class="text-[10px] font-bold opacity-40 text-center py-4">Нет новых заявок</p>';
                return;
            }
            
            list.innerHTML = apps.map((app) => `
                <div class="p-4 bg-white rounded-2xl shadow-sm border border-black/5 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-[14px] font-black uppercase text-blue-600">${app.teamName}</p>
                            <p class="text-[9px] font-bold opacity-50 uppercase flex items-center gap-1 mt-1">
                                <i data-lucide="user" class="w-3 h-3"></i> ${app.discordUsername}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="approveApplication('${app.id}')" class="px-2 py-1 bg-green-500 text-white rounded text-[9px] font-black uppercase hover:bg-green-600">Одобрить</button>
                            <button onclick="rejectApplication('${app.id}')" class="px-2 py-1 bg-red-500 text-white rounded text-[9px] font-black uppercase hover:bg-red-600">Отклонить</button>
                        </div>
                    </div>
                    <div class="text-[10px] font-bold space-y-1">
                        <p><span class="opacity-40">Ники:</span> ${app.nicks}</p>
                        <p><span class="opacity-40">BS IDs:</span> ${app.bsIds}</p>
                    </div>
                </div>
            `).join('');
            if (window.lucide) window.lucide.createIcons();
        };

        window.approveApplication = async function(appId) {
            const apps = _0xtd.applications || [];
            const idx = apps.findIndex(a => a.id === appId);
            if (idx === -1) return;
            
            const app = apps[idx];
            
            const p = (_0xtd.participants || "").split("|");
            const r = (_0xtd.teamRosters || "").split("|");
            
            while(p.length < 64) p.push("");
            while(r.length < 64) r.push("");
            
            let slotFound = -1;
            for(let i=0; i<64; i++) {
                if (!p[i].trim() || p[i].trim() === 'BYE') {
                    slotFound = i;
                    break;
                }
            }
            
            if (slotFound === -1) {
                alert("Нет свободных мест! Удалите кого-нибудь из списка.");
                return;
            }
            
            p[slotFound] = app.teamName;
            r[slotFound] = app.nicks + (app.bsIds ? ' / BS: ' + app.bsIds : '');
            
            _0xtd.participants = p.join("|");
            _0xtd.teamRosters = r.join("|");
            
            apps.splice(idx, 1);
            _0xtd.applications = apps;
            
            const procApps = _0xtd.processedApplications || [];
            if (app.discordId && !procApps.includes(app.discordId)) procApps.push(app.discordId);
            _0xtd.processedApplications = procApps;
            
            try {
                await _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
                alert(`Команда ${app.teamName} успешно добавлена на слот ${slotFound + 1}!`);
                
                const list = document.getElementById('admin-teams-list');
                if (list) list.innerHTML = ''; 
                
                window.renderTournament();
                window.renderAdminApplications();
            } catch (err) {
                alert("Ошибка сохранения: " + err.message);
            }
        };

        window.rejectApplication = async function(appId) {
            if(!confirm("Точно отклонить заявку?")) return;
            const apps = _0xtd.applications || [];
            const idx = apps.findIndex(a => a.id === appId);
            if (idx === -1) return;
            
            const app = apps[idx];
            apps.splice(idx, 1);
            _0xtd.applications = apps;
            
            const procApps = _0xtd.processedApplications || [];
            if (app.discordId && !procApps.includes(app.discordId)) procApps.push(app.discordId);
            _0xtd.processedApplications = procApps;
            
            try {
                await _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
                window.renderAdminApplications();
            } catch (err) {
                alert("Ошибка сохранения: " + err.message);
            }
        };

        function generateBracketHTML(isInteractive) {
            if (!_0xtd.matches || _0xtd.matches.length === 0) {
                return `
                    <div class="w-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 py-20">
                        <div class="w-32 h-32 bg-black/[0.02] rounded-full flex items-center justify-center animate-soon">
                            <i data-lucide="calendar" class="w-12 h-12 opacity-10"></i>
                        </div>
                        <div class="space-y-4">
                            <p class="text-[12px] font-black uppercase tracking-[0.6em] opacity-40">Турнирная сетка на стадии подготовки</p>
                        </div>
                    </div>`;
            }
            
            const rounds = [];
            const matchCount = _0xtd.matches.length;
            const roundsCount = Math.ceil(Math.log2(matchCount + 1));
            let mIdx = 0;
            
            let roundSize = Math.ceil((matchCount + 1) / 2);
            while (mIdx < matchCount) {
                rounds.push(_0xtd.matches.slice(mIdx, mIdx + roundSize));
                mIdx += roundSize;
                roundSize /= 2;
            }

            const matchH = 140;
            const gapH = 32;
            const fullH = matchH + gapH;

            return rounds.map((r, rIdx) => {
                const roundOffset = (Math.pow(2, rIdx) - 1) * (fullH / 2);
                const roundGap = (Math.pow(2, rIdx) - 1) * fullH;
                
                return `
                    <div class="bracket-round" style="padding-top: ${roundOffset}px; gap: ${roundGap + gapH}px">
                        ${r.map((m, mIdx) => {
                            const myFullIndex = _0xtd.matches.indexOf(m);
                            const isEven = mIdx % 2 === 0;
                            const isLastRound = rIdx === roundsCount - 1;
                            const nextIdx = window.getNextIndex(myFullIndex, Math.pow(2, roundsCount));
                            const nextIsActive = nextIdx !== -1 && _0xtd.matches[nextIdx] && !_0xtd.matches[nextIdx].bye;
                            
                            const peerIndexInRound = isEven ? mIdx + 1 : mIdx - 1;
                            const peer = r[peerIndexInRound];
                            const peerIsBye = !peer || peer.bye;

                            if (m.bye) return `<div class="bracket-match opacity-0 pointer-events-none"></div>`;

                            const verticalLineHeight = Math.pow(2, rIdx) * fullH / 2;
                            
                            const displayName1 = (m.t1 === 'BYE' || m.t1 === 'TBD') ? '-' : m.t1;
                            const displayName2 = (m.t2 === 'BYE' || m.t2 === 'TBD') ? '-' : m.t2;

                            return `
                                <div class="bracket-match group">
                                    <div class="match-card group-hover:shadow-[0_15px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
                                        <div class="space-y-4">
                                            <div class="flex items-center justify-between font-bold text-base ${m.s1 === 'W' || (m.s1 !== 'L' && m.s1 !== '-' && Number(m.s1) > Number(m.s2)) ? 'text-black' : 'text-black/30'}">
                                                <span class="${isInteractive && m.t1 !== 'BYE' && m.t1 !== 'TBD' ? 'cursor-pointer hover:text-blue-500 ' : ''}truncate max-w-[150px] uppercase tracking-tighter" ${isInteractive && m.t1 !== 'BYE' && m.t1 !== 'TBD' ? 'onclick="advanceTeam(' + myFullIndex + ', 1)"' : ''}>${displayName1}</span>
                                                <span class="font-black text-[12px]">${m.s1}</span>
                                            </div>
                                            <div class="h-[1px] bg-black/5 w-full"></div>
                                            <div class="flex items-center justify-between font-bold text-base ${m.s2 === 'W' || (m.s2 !== 'L' && m.s2 !== '-' && Number(m.s2) > Number(m.s1)) ? 'text-black' : 'text-black/30'}">
                                                <span class="${isInteractive && m.t2 !== 'BYE' && m.t2 !== 'TBD' ? 'cursor-pointer hover:text-blue-500 ' : ''}truncate max-w-[150px] uppercase tracking-tighter" ${isInteractive && m.t2 !== 'BYE' && m.t2 !== 'TBD' ? 'onclick="advanceTeam(' + myFullIndex + ', 2)"' : ''}>${displayName2}</span>
                                                <span class="font-black text-[12px]">${m.s2}</span>
                                            </div>
                                        </div>
                                    </div>

                                    ${isLastRound ? `
                                        <div class="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                            <div class="relative">
                                                <div class="absolute inset-0 bg-yellow-400 blur-xl opacity-50 rounded-full animate-pulse"></div>
                                                <i data-lucide="crown" class="w-16 h-16 text-yellow-500 relative drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"></i>
                                            </div>
                                            <span class="text-xs font-black uppercase tracking-[0.4em] text-yellow-600 mt-4 drop-shadow-md">Победитель</span>
                                        </div>
                                    ` : ''}
                                    ${rIdx > 0 ? `<div class="connector-from-prev"></div>` : ''}
                                    ${!isLastRound && nextIsActive ? `
                                        <div class="connector-line"></div>
                                        <div class="connector-vertical" style="
                                            height: calc(${verticalLineHeight}px + 4px);
                                            ${isEven ? 'top: calc(50% - 2px)' : 'bottom: calc(50% - 2px)'};
                                        "></div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }).join('');
        }

        window.renderTournament = function() {
            const e = {
                bracket: document.getElementById('bracket-container'),
                hBracket: document.getElementById('host-bracket-container'),
                aControls: document.getElementById('admin-controls'),
                aLogin: document.getElementById('admin-login-screen'),
                hControls: document.getElementById('host-controls'),
                hLogin: document.getElementById('host-auth-screen'),
                upcoming: document.getElementById('upcoming-matches')
            };

            // Active Matches rendering
            const activeCont = document.getElementById('active-matches-container');
            if (activeCont) {
                const active = _0xtd.activeMatches || [];
                if (active.length === 0) {
                    activeCont.innerHTML = '<p class="text-center opacity-40 font-bold italic py-8">Сейчас нет активных матчей</p>';
                } else {
                    activeCont.innerHTML = active.map(function(m) {
                        return '<div class="p-8 md:p-12 bg-black text-white rounded-[32px] md:rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative overflow-hidden group">' +
                            '<div class="absolute top-0 right-0 p-8 opacity-10">' +
                                '<i data-lucide="zap" class="w-24 h-24 md:w-32 md:h-32"></i>' +
                            '</div>' +
                            '<div class="flex-1 text-center md:text-right w-full">' +
                                '<div class="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter break-words text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">' + m.p1 + '</div>' +
                            '</div>' +
                            '<div class="flex flex-col items-center gap-4 z-10 shrink-0">' +
                                '<div class="text-3xl md:text-5xl font-black italic whitespace-nowrap drop-shadow-lg text-yellow-500">' + m.score + '</div>' +
                                (m.link ? '<a href="' + m.link + '" target="_blank" class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/30 whitespace-nowrap animate-pulse-glow">Присоединиться</a>' : '') +
                            '</div>' +
                            '<div class="flex-1 text-center md:text-left w-full">' +
                                '<div class="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter break-words text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">' + m.p2 + '</div>' +
                            '</div>' +
                        '</div>';
                    }).join('');
                }
            }

            // Schedule rendering
            const eUpcoming = document.getElementById('upcoming-matches');
            if (eUpcoming) {
                const sched = _0xtd.scheduleMatches || [];
                if (sched.length === 0) {
                     eUpcoming.innerHTML = '<p class="text-left font-bold opacity-30 text-sm">Нет предстоящих матчей</p>';
                } else {
                    eUpcoming.innerHTML = sched.map(function(s) {
                        return '<div class="p-6 bg-white border border-black/5 rounded-[24px] flex items-center justify-between">' +
                            '<span class="text-lg md:text-2xl font-black uppercase tracking-tighter">' + s.p1 + ' <span class="opacity-20 mx-2 text-sm">VS</span> ' + s.p2 + '</span>' +
                            '<span class="px-5 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">' + s.time + '</span>' +
                        '</div>';
                    }).join('');
                }
            }

            // Update Prizes Display
            if (_0xtd.prizes) {
                const p1 = document.getElementById('prize-1-display');
                if (p1) p1.innerText = _0xtd.prizes.prize1 || "BRAWL PASS PLUS";
                const p2 = document.getElementById('prize-2-display');
                if (p2) p2.innerText = _0xtd.prizes.prize2 || "BRAWL PASS";
                const p3 = document.getElementById('prize-3-display');
                if (p3) p3.innerText = _0xtd.prizes.prize3 || "170 GEMS";
                
                // Also update admin inputs
                const aP1 = document.getElementById('admin-prize-1');
                if (aP1 && !aP1.value) aP1.value = _0xtd.prizes.prize1 || "BRAWL PASS PLUS";
                const aP2 = document.getElementById('admin-prize-2');
                if (aP2 && !aP2.value) aP2.value = _0xtd.prizes.prize2 || "BRAWL PASS";
                const aP3 = document.getElementById('admin-prize-3');
                if (aP3 && !aP3.value) aP3.value = _0xtd.prizes.prize3 || "170 GEMS";

                const aDiscord = document.getElementById('admin-discord-client');
                if (aDiscord && aDiscord.value === '') aDiscord.value = _0xtd.discordClientId || "";
                
                // Update prize texts on the home page as well
                const homePrizesText = document.querySelector('#tab-home .grid div:first-child .text-5xl');
                if (homePrizesText) homePrizesText.innerText = _0xtd.prizes.prize1 || "BRAWL PASS PLUS";
            }

            // Update Teams Display
            const teamsDisplay = document.getElementById('teams-list-display');
            if (teamsDisplay) {
                const p = (_0xtd.participants || "").split("|");
                const r = (_0xtd.teamRosters || "").split("|");
                let html = '';
                for(let i=0; i<p.length; i++) {
                    const teamName = p[i].trim();
                    if(teamName && teamName !== 'BYE' && teamName !== 'TBD') {
                        let rosterText = r[i] || 'Не указаны';
                        let bsIdsText = '';
                        if (rosterText.includes(' / BS: ')) {
                            const parts = rosterText.split(' / BS: ');
                            rosterText = parts[0];
                            bsIdsText = parts[1];
                        }

                        html += `
                        <div class="p-6 bg-white border border-black/5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden text-left flex flex-col gap-4">
                            <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div class="relative z-10">
                                <h4 class="text-2xl font-black uppercase tracking-tight text-gray-900 truncate">${teamName}</h4>
                            </div>
                            <div class="relative z-10 space-y-2 flex-1">
                                <div class="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                    <p class="text-[9px] font-black uppercase tracking-widest text-blue-500/70 mb-0.5">Дискорд</p>
                                    <p class="text-[12px] font-bold text-gray-700 truncate">${rosterText}</p>
                                </div>
                                ${bsIdsText ? `
                                <div class="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                                    <p class="text-[9px] font-black uppercase tracking-widest text-orange-500/70 mb-0.5">Brawl Stars ID</p>
                                    <p class="text-[12px] font-bold text-gray-700 truncate">${bsIdsText}</p>
                                </div>` : ''}
                            </div>
                        </div>`;
                    }
                }
                if (!html) {
                    html = '<p class="text-center opacity-40 font-bold italic w-full col-span-full py-12">Команды еще не добавлены</p>';
                }
                teamsDisplay.innerHTML = html;
                if (window.lucide) window.lucide.createIcons();
            }

            // Host Panel UI
            if (_0xhl) {
                if (e.hLogin) e.hLogin.classList.add('hidden');
                if (e.hControls) e.hControls.classList.remove('hidden');
                
                const hostActive = document.getElementById('host-active-matches-list');
                if (hostActive) {
                    const active = _hostActiveMatches;
                    hostActive.innerHTML = active.map(function(m, idx) {
                        return '<div class="p-4 bg-black/5 rounded-2xl space-y-4">' +
                            '<div class="flex items-center justify-between">' +
                                '<span class="text-[10px] font-black uppercase opacity-40">Матч ' + (idx+1) + '</span>' +
                                '<button onclick="removeHostActiveMatch(' + idx + ')" class="p-1 text-red-500 hover:bg-red-100 rounded-full"><i data-lucide="trash" class="w-4 h-4"></i></button>' +
                            '</div>' +
                            '<div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">' +
                                '<input type="text" value="' + m.p1 + '" onchange="updateHostActiveMatch(' + idx + ', \'p1\', this.value)" class="w-full p-3 bg-white border-none rounded-xl font-bold text-center text-xs" placeholder="Игрок 1">' +
                                '<input type="text" value="' + m.score + '" onchange="updateHostActiveMatch(' + idx + ', \'score\', this.value)" class="w-16 p-3 bg-white border-none rounded-xl font-black text-center text-xs" placeholder="0 : 0">' +
                                '<input type="text" value="' + m.p2 + '" onchange="updateHostActiveMatch(' + idx + ', \'p2\', this.value)" class="w-full p-3 bg-white border-none rounded-xl font-bold text-center text-xs" placeholder="Игрок 2">' +
                            '</div>' +
                            '<input type="text" value="' + (m.link || '') + '" onchange="updateHostActiveMatch(' + idx + ', \'link\', this.value)" class="w-full p-3 bg-white border-none rounded-xl font-medium text-xs mt-2" placeholder="Ссылка на дискорд (Join)">' +
                        '</div>';
                    }).join('');
                }

                const hostSched = document.getElementById('host-schedule-list');
                if (hostSched) {
                    const sched = _hostScheduleMatches;
                    hostSched.innerHTML = sched.map(function(s, idx) {
                        return '<div class="p-4 bg-black/5 rounded-2xl space-y-4">' +
                            '<div class="flex items-center justify-between">' +
                                '<span class="text-[10px] font-black uppercase opacity-40">Игра ' + (idx+1) + '</span>' +
                                '<button onclick="removeHostScheduleMatch(' + idx + ')" class="p-1 text-red-500 hover:bg-red-100 rounded-full"><i data-lucide="trash" class="w-4 h-4"></i></button>' +
                            '</div>' +
                            '<div class="flex gap-2">' +
                                '<input type="text" value="' + s.p1 + '" onchange="updateHostScheduleMatch(' + idx + ', \'p1\', this.value)" class="flex-1 p-3 bg-white border-none rounded-xl font-bold text-xs" placeholder="Команда 1">' +
                                '<span class="text-[10px] font-black opacity-30 mt-3">VS</span>' +
                                '<input type="text" value="' + s.p2 + '" onchange="updateHostScheduleMatch(' + idx + ', \'p2\', this.value)" class="flex-1 p-3 bg-white border-none rounded-xl font-bold text-xs" placeholder="Команда 2">' +
                                '<input type="text" value="' + s.time + '" onchange="updateHostScheduleMatch(' + idx + ', \'time\', this.value)" class="w-20 p-3 bg-white border-none rounded-xl font-bold text-xs text-center" placeholder="Вр. / Эт.">' +
                            '</div>' +
                        '</div>';
                    }).join('');
                }
            } else {
                if (e.hLogin) e.hLogin.classList.remove('hidden');
                if (e.hControls) e.hControls.classList.add('hidden');
            }

            if (_0xal) {
                if (e.aLogin) e.aLogin.classList.add('hidden');
                if (e.aControls) e.aControls.classList.remove('hidden');
                const i = {
                    p1: document.getElementById('admin-p1-name'),
                    p2: document.getElementById('admin-p2-name'),
                    score: document.getElementById('admin-score'),
                    parts: document.getElementById('admin-participants-input')
                };
                if (i.p1) i.p1.value = _0xtd.currentMatch.p1;
                if (i.p2) i.p2.value = _0xtd.currentMatch.p2;
                if (i.score) i.score.value = _0xtd.currentMatch.score;
                if (i.parts) i.parts.value = _0xtd.participants || "";

                const bi = document.getElementById('admin-bracket-inputs');
                if (bi && _0xtd.matches) {
                    bi.innerHTML = _0xtd.matches.map(function(m, idx) {
                        return '<div class="space-y-3 border-b border-black/5 pb-4">' +
                            '<div class="text-[10px] font-black uppercase opacity-20">' + (m.id || "") + '</div>' +
                            '<div class="grid grid-cols-2 gap-4">' +
                                '<input type="text" data-idx="' + idx + '" data-key="t1" value="' + m.t1 + '" class="p-3 bg-black/5 border-none rounded-xl text-xs font-bold">' +
                                '<input type="text" data-idx="' + idx + '" data-key="s1" value="' + m.s1 + '" class="p-3 bg-black/5 border-none rounded-xl text-xs font-bold text-center">' +
                                '<input type="text" data-idx="' + idx + '" data-key="t2" value="' + m.t2 + '" class="p-3 bg-black/5 border-none rounded-xl text-xs font-bold">' +
                                '<input type="text" data-idx="' + idx + '" data-key="s2" value="' + m.s2 + '" class="p-3 bg-black/5 border-none rounded-xl text-xs font-bold text-center">' +
                            '</div>' +
                        '</div>';
                    }).join('');
                }
            } else {
                if (e.aLogin) e.aLogin.classList.remove('hidden');
                if (e.aControls) e.aControls.classList.add('hidden');
            }

            if (e.bracket) {
                e.bracket.innerHTML = generateBracketHTML(false); // View only
            }

            if (e.hBracket) {
                e.hBracket.innerHTML = generateBracketHTML(true); // Interactive
            }

            if (window.lucide) lucide.createIcons();
        };

        function setupPanZoom(wrapperId, containerId) {
            const wrapper = document.getElementById(wrapperId);
            const container = document.getElementById(containerId);
            if (!wrapper || !container) return;
            
            container.style.willChange = "transform";

            let scale = 0.5;
            let posX = 100;
            let posY = 100;
            let isDown = false;
            let startX, startY;
            let pendingUpdate = false;

            function restrictBounds() {
                const padding = 200; // Extra space to grab
                const cW = container.offsetWidth * scale;
                const cH = container.offsetHeight * scale;
                const wW = wrapper.offsetWidth;
                const wH = wrapper.offsetHeight;
                
                const minX = Math.min(padding, wW - cW - padding);
                const minY = Math.min(padding, wH - cH - padding);
                const maxX = Math.max(padding, wW - cW - padding);
                const maxY = Math.max(padding, wH - cH - padding);
                
                posX = Math.max(Math.min(minX, maxX), Math.min(Math.max(minX, maxX), posX));
                posY = Math.max(Math.min(minY, maxY), Math.min(Math.max(minY, maxY), posY));
            }

            function updateTransform() {
                if (!pendingUpdate) {
                    pendingUpdate = true;
                    requestAnimationFrame(() => {
                        restrictBounds();
                        container.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`;
                        pendingUpdate = false;
                    });
                }
            }

            updateTransform();

            wrapper.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.clientX - posX;
                startY = e.clientY - posY;
            });

            window.addEventListener('mouseup', () => { isDown = false; });

            window.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                posX = e.clientX - startX;
                posY = e.clientY - startY;
                updateTransform();
            }, { passive: true });

            wrapper.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const newScale = Math.min(Math.max(0.1, scale + delta), 2);
                
                // Adjust position to zoom towards cursor
                const rect = wrapper.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const zoomFactor = newScale / scale;
                posX = mouseX - (mouseX - posX) * zoomFactor;
                posY = mouseY - (mouseY - posY) * zoomFactor;
                
                scale = newScale;
                updateTransform();
            }, { passive: false });
        }
        
        function initPanScroll() {
            setupPanZoom('bracket-pan-zoom', 'bracket-container');
            setupPanZoom('host-bracket-pan-zoom', 'host-bracket-container');
        }

        // Polling wait for element if needed or just call once
        setTimeout(initPanScroll, 1000);

        const _hx = async (str) => {
            const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        };

        window.handleAdminLogin = async function() {
            const pi = document.getElementById('admin-password-input');
            if (pi && pi.value) {
                try {
                    const hashed = await _hx(pi.value);
                    if (hashed === "7a37a15b570261d6ff68ed85c09d1adecc35e4d2d9415e77877ffd8fbc6f8b41") {
                        _0xal = true;
                        window.renderTournament();
                        window.renderAdminApplications();
                        window.showTab('admin');
                        
                        // Initialize 64 inputs
                        const list = document.getElementById('admin-teams-list');
                        if (list && list.children.length === 0) {
                            const savedNames = (_0xtd.participants || "").split("|");
                            const savedRosters = (_0xtd.teamRosters || "").split("|");
                            for (let i = 1; i <= 64; i++) {
                                const div = document.createElement('div');
                                div.className = "space-y-1 bg-white p-2 rounded-2xl shadow-sm border border-black/5";
                                div.innerHTML = '<span class="text-[8px] opacity-30 font-bold uppercase tracking-widest pl-2">Команда ' + i + '</span>' +
                                                '<input type="text" class="team-input w-full p-2 bg-black/5 border-none rounded-xl text-[10px] font-bold mb-1" value="' + (savedNames[i-1] || '') + '" placeholder="Название...">' +
                                                '<input type="text" class="team-roster-input w-full p-2 bg-black/5 border-none rounded-xl text-[10px] font-medium" value="' + (savedRosters[i-1] || '') + '" placeholder="Дискорд ники (через запятую)...">';
                                list.appendChild(div);
                            }
                        }
                    } else {
                        alert("Ошибка: Неверный пароль.");
                    }
                } catch (err) {
                    alert("Ошибка среды. Загрузите в надежном браузере.");
                    console.error(err);
                }
            }
        };

        window.handleHostLogin = async function() {
            const pi = document.getElementById('host-password-input');
            if (pi && pi.value) {
                try {
                    const hashed = await _hx(pi.value);
                    if (hashed === "d3affcf04074b46c596f28b464bfed95803f9e982ef5d04f75c1d94e128facf4") {
                        _0xhl = true;
                        window.renderTournament();
                    } else {
                        alert("Ошибка: Неверный код доступа.");
                    }
                } catch (err) {
                    alert("Ошибка среды. Загрузите в надежном браузере.");
                    console.error(err);
                }
            }
        };

        window.handleAdminLogout = function() { _0xal = false; window.renderTournament(); window.showTab('home'); };
        window.handleHostLogout = function() { _0xhl = false; window.renderTournament(); window.showTab('home'); };

        window.saveAdminData = async function() {
            if (!_0xal) return;
            const teamInputs = document.querySelectorAll('.team-input');
            const participants = Array.from(teamInputs).map(i => i.value.trim()).join("|");
            
            const rosterInputs = document.querySelectorAll('.team-roster-input');
            const teamRosters = Array.from(rosterInputs).map(i => i.value.trim()).join("|");
            
            const n = {
                ..._0xtd,
                discordClientId: document.getElementById('admin-discord-client')?.value.trim() || "",
                currentMatch: {
                    p1: document.getElementById('admin-p1-name').value,
                    p2: document.getElementById('admin-p2-name').value,
                    score: document.getElementById('admin-score').value
                },
                prizes: {
                    prize1: document.getElementById('admin-prize-1').value || "BRAWL PASS PLUS",
                    prize2: document.getElementById('admin-prize-2').value || "BRAWL PASS",
                    prize3: document.getElementById('admin-prize-3').value || "170 GEMS"
                },
                participants,
                teamRosters,
                matches: _0xtd.matches.map((m, i) => {
                    const ins = document.querySelectorAll(`#admin-bracket-inputs input[data-idx="${i}"]`);
                    const r = { ...m };
                    ins.forEach(inp => { r[inp.dataset.key] = inp.value; });
                    return r;
                }),
                participants: participants
            };
            try {
                await _0xsd(_0xdc(_0xdb, "tournament", "data"), n);
                alert("Данные успешно сохранены!");
            } catch (err) {
                alert("Ошибка сохранения.");
            }
        };

        window.clearBracket = async function() {
            if (!confirm("Вы уверены, что хотите полностью удалить турнирную сетку?")) return;
            
            try {
                // Clear local inputs
                document.querySelectorAll('.team-input').forEach(i => i.value = "");
                
                // Construct completely empty data
                const emptyData = {
                    currentMatch: { p1: "Скоро", p2: "Скоро", score: "0 : 0" },
                    matches: [],
                    schedule: [],
                    timerEnd: null,
                    participants: ""
                };
                
                // Write to Database
                await _0xsd(_0xdc(_0xdb, "tournament", "data"), emptyData);
                
                // Update local state and UI immediately
                _0xtd = emptyData;
                window.renderTournament();
                window.updateCurrentMatch();
                
                alert("Турнирная сетка успешно удалена.");
            } catch (err) {
                console.error("Critical Deletion Failed:", err);
                alert("Ошибка при доступе к базе данных. Проверьте соединение.");
            }
        };

        window.generateBracket = async function() {
            const inputs = document.querySelectorAll('.team-input');
            const names = Array.from(inputs).map(i => i.value.trim() || "BYE");
            
            const count = 64;
            const roundsCount = 6; // log2(64)
            const slots = 64;
            const matches = [];
            
            // 1. Create full skeleton (127 items total for a 64-team single elimination)
            // Round 1: 32, Round 2: 16, Round 3: 8, Round 4: 4, Round 5: 2, Round 6: 1
            let currentRSize = slots / 2;
            let rNum = 1;
            while (currentRSize >= 1) {
                for (let m = 0; m < currentRSize; m++) {
                    matches.push({
                        id: `R${rNum} M${m + 1}`,
                        t1: "TBD", s1: "0",
                        t2: "TBD", s2: "0",
                        bye: false
                    });
                }
                currentRSize /= 2;
                rNum++;
            }

            // Internal advancement helper
            const advanceInGen = (mIdx, team) => {
                let off = 0;
                let rSize = slots / 2;
                while (rSize > 1) {
                    if (mIdx >= off && mIdx < off + rSize) {
                        const nIdx = (off + rSize) + Math.floor((mIdx - off) / 2);
                        if ((mIdx - off) % 2 === 0) matches[nIdx].t1 = team;
                        else matches[nIdx].t2 = team;
                        return;
                    }
                    off += rSize;
                    rSize /= 2;
                }
            };

            // 2. Fill Round 1
            for (let i = 0; i < 32; i++) {
                const p1 = names[i * 2];
                const p2 = names[i * 2 + 1];
                matches[i].t1 = p1;
                matches[i].t2 = p2;
                
                if (p1 === "BYE" && p2 === "BYE") {
                    matches[i].bye = true;
                } else if (p2 === "BYE") {
                    matches[i].s1 = "W"; matches[i].s2 = "-";
                    advanceInGen(i, p1);
                } else if (p1 === "BYE") {
                    matches[i].s1 = "-"; matches[i].s2 = "W";
                    advanceInGen(i, p2);
                }
            }

            _0xtd.matches = matches;
            _0xtd.participants = names.join("|");
            
            try {
                await _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
                alert("Сетка на 64 команды создана!");
                window.renderTournament();
            } catch (err) {
                console.error("Save Error:", err);
            }
        };

        // Utility for internal generation
        window.getNextIndex = (idx, totalSlots) => {
            let offset = 0;
            let rSize = totalSlots / 2;
            while (rSize > 1) {
                if (idx >= offset && idx < offset + rSize) {
                    const nextOffset = offset + rSize;
                    return nextOffset + Math.floor((idx - offset) / 2);
                }
                offset += rSize;
                rSize /= 2;
            }
            return -1;
        };

        window.internalAdvanceSimple = (matchList, mIdx, team, totalSlots) => {
            let offset = 0;
            let rSize = totalSlots / 2;
            let curIdx = mIdx;
            
            while (rSize > 1) {
                if (curIdx >= offset && curIdx < offset + rSize) {
                    const nextOffset = offset + rSize;
                    const rel = curIdx - offset;
                    const nIdx = nextOffset + Math.floor(rel / 2);
                    
                    if (rel % 2 === 0) matchList[nIdx].t1 = team;
                    else matchList[nIdx].t2 = team;
                    
                    matchList[nIdx].bye = false;
                    return;
                }
                offset += rSize;
                rSize /= 2;
            }
        };

        // Re-implementing helper because 'this' context might be tricky in window
        window.getOffset = (idx, slots) => {
            let offset = 0;
            let rSize = slots / 2;
            while (rSize >= 1) {
                if (idx >= offset && idx < offset + rSize) return offset;
                offset += rSize;
                rSize /= 2;
            }
            return 0;
        };

        window.adv = (matchList, mIdx, team, slots) => {
            let offset = 0;
            let rSize = slots / 2;
            while (rSize > 1) {
                if (mIdx >= offset && mIdx < offset + rSize) {
                    const nextOffset = offset + rSize;
                    const rel = mIdx - offset;
                    const nIdx = nextOffset + Math.floor(rel / 2);
                    if (rel % 2 === 0) matchList[nIdx].t1 = team;
                    else matchList[nIdx].t2 = team;
                    matchList[nIdx].bye = false;
                    return;
                }
                offset += rSize;
                rSize /= 2;
            }
        };

        window.advanceTeam = function(matchIdx, teamNum) {
            if (!_0xhl && !_0xal) return;
            const match = _0xtd.matches[matchIdx];
            const teamName = teamNum === 1 ? match.t1 : match.t2;
            if (teamName === "TBD" || teamName === "BYE") return;

            // Set score to show winner visually
            if (teamNum === 1) { match.s1 = "W"; match.s2 = "L"; }
            else { match.s1 = "L"; match.s2 = "W"; }

            const matchCount = _0xtd.matches.length;
            const slots = Math.pow(2, Math.ceil(Math.log2((matchCount + 1))));
            
            let currentOffset = 0;
            let rSize = slots / 2;
            let advanced = false;

            while (rSize > 1) {
                if (matchIdx >= currentOffset && matchIdx < currentOffset + rSize) {
                    const nextOffset = currentOffset + rSize;
                    const relIdx = matchIdx - currentOffset;
                    const nextMIdx = nextOffset + Math.floor(relIdx / 2);
                    
                    if (relIdx % 2 === 0) _0xtd.matches[nextMIdx].t1 = teamName;
                    else _0xtd.matches[nextMIdx].t2 = teamName;
                    
                    advanced = true;
                    break;
                }
                currentOffset += rSize;
                rSize /= 2;
            }

            _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
            window.renderTournament();
        };

        window.setHostTimer = function() {
            const sec = parseInt(document.getElementById('host-timer-input').value);
            _0xtd.timerEnd = Date.now() + (sec * 1000);
            _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
        };

        window._hostActiveMatches = [];
        window._hostScheduleMatches = [];

        window.addHostActiveMatch = function() {
            window._hostActiveMatches.push({ p1: "", p2: "", score: "0 : 0", link: "" });
            window.renderTournament();
        };

        window.removeHostActiveMatch = function(idx) {
            window._hostActiveMatches.splice(idx, 1);
            window.renderTournament();
        };

        window.updateHostActiveMatch = function(idx, field, val) {
            window._hostActiveMatches[idx][field] = val;
        };

        window.addHostScheduleMatch = function() {
            window._hostScheduleMatches.push({ p1: "", p2: "", time: "" });
            window.renderTournament();
        };

        window.removeHostScheduleMatch = function(idx) {
            window._hostScheduleMatches.splice(idx, 1);
            window.renderTournament();
        };

        window.updateHostScheduleMatch = function(idx, field, val) {
            window._hostScheduleMatches[idx][field] = val;
        };

        window.saveHostData = function() {
            _0xtd.activeMatches = window._hostActiveMatches;
            _0xtd.scheduleMatches = window._hostScheduleMatches;
            _0xsd(_0xdc(_0xdb, "tournament", "data"), _0xtd);
            alert("Данные успешно сохранены!");
        };

        window.showTab = function(id, updateHash = true) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const t = document.getElementById('tab-' + id) || document.getElementById(id + '-tab');
            if (t) {
                t.classList.add('active');
                const bs = document.querySelectorAll(`button[onclick*="showTab('${id}')"]`);
                bs.forEach(b => b.classList.add('active'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (id === 'bracket' && window.renderTournament) window.renderTournament();
                
                if (updateHash) {
                    history.pushState(null, '', '#' + id);
                }
            }
        };

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                window.showTab(hash, false);
            } else {
                window.showTab('home', false);
            }
        });

        window.showAdminPrompt = function() { window.showTab('admin'); };
        window.toggleMobileMenu = function() { document.getElementById('mobile-menu').classList.toggle('hidden'); };
        window.openConfirmModal = function() { document.getElementById('confirm-modal').classList.remove('hidden'); };
        window.closeConfirmModal = function() { document.getElementById('confirm-modal').classList.add('hidden'); };

        // Protections & Secret Combo
        let keys = {};
        document.addEventListener('keydown', e => {
            const k = e.key.toLowerCase();
            keys[k] = true;
            
            // Single key 'p' for host panel (as requested)
            // But skip if typing in input
            if (k === 'p' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                window.showTab('host');
            }

            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                return false;
            }
        });
        document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

        document.addEventListener('contextmenu', e => e.preventDefault());
        setInterval(function() { (function() { return false; }['constructor']('debugger')['call']()); }, 50);
        setInterval(() => { console.clear(); }, 1000);

        // Timer calculation
        function updateCountdowns() {
            const els = document.querySelectorAll('.countdown');
            if (_0xtd.timerEnd) {
                const diff = _0xtd.timerEnd - Date.now();
                if (diff > 0) {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    const timeStr = `${h.toString().padStart(2,'0')}ч ${m.toString().padStart(2,'0')}м ${s.toString().padStart(2,'0')}с`;
                    els.forEach(el => el.innerText = timeStr);
                } else {
                    els.forEach(el => el.innerText = "Матч начался!");
                }
            } else {
                els.forEach(el => el.innerText = "00ч 00м 00с");
            }
        }
        setInterval(updateCountdowns, 1000);

        window.renderTournament();

        // Initial Routing based on Hash
        window.addEventListener('DOMContentLoaded', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                window.showTab(hash, false);
            } else {
                window.showTab('home', false);
            }
        });