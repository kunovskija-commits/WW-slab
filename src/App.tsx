import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Info, 
  ChevronRight, 
  Clock, 
  ShieldCheck,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

// --- Types ---
type Tab = 'home' | 'schedule' | 'bracket' | 'rules';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface Match {
  id: string;
  player1: Participant | null;
  player2: Participant | null;
  score1?: number;
  score2?: number;
  status: 'upcoming' | 'live' | 'finished';
  startTime?: string;
}

// --- Data ---
const PARTICIPANTS: Participant[] = [
  { id: '1', name: 'апатийка' },
  { id: '2', name: 'даня' },
  { id: '3', name: 'мирик' },
  { id: '4', name: 'эскадор' },
  { id: '5', name: 'банворлд' },
  { id: '6', name: 'анлак' },
  { id: '7', name: 'настя' },
  { id: '8', name: 'маша' },
];

// --- Components ---

const ShimmerBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] opacity-40"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(255, 204, 0, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, rgba(255, 100, 255, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 40% 80%, rgba(100, 200, 255, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 70% 70%, rgba(200, 255, 100, 0.1) 0%, transparent 40%)
        `,
        filter: 'blur(80px)'
      }}
    />
  </div>
);

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (t: Tab) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'home', label: 'Главная', icon: Info },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'bracket', label: 'Сетка', icon: Trophy },
    { id: 'rules', label: 'Правила', icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">BRAWL RU TOURNAMENT</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative py-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === item.id ? 'text-black' : 'text-black/40 hover:text-black'
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 text-lg font-bold uppercase tracking-widest ${
                    activeTab === item.id ? 'text-black' : 'text-black/40'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const BracketNode = ({ match, round }: { match: Match, round: number }) => (
  <div className="relative flex flex-col gap-1 w-48 group">
    <div className={`p-3 rounded-lg border transition-all ${
      match.status === 'live' ? 'border-black bg-black text-white shadow-lg' : 'border-black/10 bg-white/50'
    }`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Match {match.id}</span>
        {match.status === 'live' && (
          <span className="flex items-center gap-1 text-[10px] font-black text-red-500 animate-pulse">
            <div className="w-1 h-1 bg-red-500 rounded-full" /> LIVE
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-bold truncate ${match.score1 && match.score2 && match.score1 > match.score2 ? 'opacity-100' : 'opacity-60'}`}>
            {match.player1?.name || 'TBD'}
          </span>
          <span className="text-sm font-black">{match.score1 ?? '-'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm font-bold truncate ${match.score1 && match.score2 && match.score2 > match.score1 ? 'opacity-100' : 'opacity-60'}`}>
            {match.player2?.name || 'TBD'}
          </span>
          <span className="text-sm font-black">{match.score2 ?? '-'}</span>
        </div>
      </div>
    </div>
    {/* Connector Lines (simplified for this demo) */}
    {round < 3 && (
      <div className="absolute -right-6 top-1/2 w-6 h-[1px] bg-black/10" />
    )}
  </div>
);

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft('LIVE');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-mono text-sm font-black">{timeLeft}</span>;
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-black selection:bg-black selection:text-white">
      <ShimmerBackground />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              <section className="text-center space-y-8 py-20">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-1.5 rounded-full bg-black/5 border border-black/5 text-[10px] font-black uppercase tracking-[0.3em]"
                >
                  Season 2024 • Moderation Clash
                </motion.div>
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                  BRAWL RU<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black/40 to-black">MASTERS</span>
                </h1>
                <p className="max-w-xl mx-auto text-lg text-black/60 font-medium leading-relaxed">
                  Элитный турнир среди модерации сервера Brawl Stars RU. 
                  8 участников, одна сетка, один чемпион.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-8">
                  <button 
                    onClick={() => setActiveTab('bracket')}
                    className="px-10 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-3"
                  >
                    Смотреть сетку <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className="px-10 py-5 bg-white border border-black/10 rounded-full font-black uppercase tracking-widest text-xs hover:bg-black/5 transition-colors"
                  >
                    Расписание
                  </button>
                </div>
              </section>

              <section className="grid md:grid-cols-3 gap-8">
                {[
                  { title: 'Призовой фонд', value: '10,000₽', desc: 'Для победителя и финалистов' },
                  { title: 'Участников', value: '8', desc: 'Лучшие модераторы сервера' },
                  { title: 'Формат', value: 'BO3', desc: 'Best of 3 в каждом матче' },
                ].map((stat, i) => (
                  <div key={i} className="p-10 bg-white/50 backdrop-blur-sm border border-black/5 rounded-[40px] space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.title}</div>
                    <div className="text-5xl font-black tracking-tighter">{stat.value}</div>
                    <p className="text-sm font-medium opacity-60">{stat.desc}</p>
                  </div>
                ))}
              </section>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tighter uppercase">Кто играет сейчас</h2>
                  <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Актуальное расписание и LIVE матчи</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> 1 Live Match
                </div>
              </div>

              <div className="space-y-4">
                {/* Live Match */}
                <div className="p-8 bg-black text-white rounded-[32px] shadow-2xl shadow-black/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <div className="px-3 py-1 bg-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">LIVE</div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-right space-y-2">
                    <div className="text-6xl font-black tracking-tighter">апатийка</div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-40">Moderator</div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl font-black italic">2 : 1</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">VS</div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="text-6xl font-black tracking-tighter">банворлд</div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-40">Admin</div>
                  </div>
                </div>

                {/* Upcoming Matches */}
                <div className="grid gap-4">
                  {[
                    { p1: 'даня', p2: 'анлак', time: '2026-04-16T18:00:00' },
                    { p1: 'мирик', p2: 'настя', time: '2026-04-16T20:00:00' },
                    { p1: 'эскадор', p2: 'маша', time: '2026-04-17T12:00:00' },
                  ].map((m, i) => (
                    <div key={i} className="p-8 bg-white border border-black/5 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-black/20 transition-colors">
                      <div className="flex items-center gap-8 flex-1">
                        <div className="text-2xl font-black tracking-tight">{m.p1}</div>
                        <div className="text-[10px] font-black opacity-20">VS</div>
                        <div className="text-2xl font-black tracking-tight">{m.p2}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-black/40">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-bold">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="px-6 py-3 bg-black/5 rounded-full">
                          <Countdown targetDate={m.time} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bracket' && (
            <motion.div
              key="bracket"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tighter uppercase">Турнирная сетка</h2>
                <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Путь к чемпионству</p>
              </div>

              <div className="overflow-x-auto pb-12">
                <div className="flex gap-16 min-w-max">
                  {/* Quarter Finals */}
                  <div className="space-y-12">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Quarter Finals</div>
                    <div className="space-y-8">
                      <BracketNode match={{ id: '1', player1: PARTICIPANTS[0], player2: PARTICIPANTS[4], status: 'live', score1: 2, score2: 1 }} round={1} />
                      <BracketNode match={{ id: '2', player1: PARTICIPANTS[1], player2: PARTICIPANTS[5], status: 'upcoming' }} round={1} />
                      <BracketNode match={{ id: '3', player1: PARTICIPANTS[2], player2: PARTICIPANTS[6], status: 'upcoming' }} round={1} />
                      <BracketNode match={{ id: '4', player1: PARTICIPANTS[3], player2: PARTICIPANTS[7], status: 'upcoming' }} round={1} />
                    </div>
                  </div>

                  {/* Semi Finals */}
                  <div className="space-y-12 pt-16">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Semi Finals</div>
                    <div className="space-y-32">
                      <BracketNode match={{ id: '5', player1: null, player2: null, status: 'upcoming' }} round={2} />
                      <BracketNode match={{ id: '6', player1: null, player2: null, status: 'upcoming' }} round={2} />
                    </div>
                  </div>

                  {/* Grand Final */}
                  <div className="space-y-12 pt-48">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Grand Final</div>
                    <div className="space-y-8">
                      <div className="p-1 w-52 rounded-[24px] bg-gradient-to-br from-[#ffcc00] via-[#ffaa00] to-[#ffcc00] shadow-2xl shadow-yellow-500/20">
                        <div className="bg-white rounded-[20px] p-6 space-y-4">
                          <Trophy className="w-8 h-8 mx-auto text-yellow-500" />
                          <BracketNode match={{ id: '7', player1: null, player2: null, status: 'upcoming' }} round={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black tracking-tighter uppercase">Кодекс чести</h2>
                <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Правила турнира модерации</p>
              </div>

              <div className="space-y-6">
                {[
                  { q: 'Формат матчей', a: 'Все матчи проходят в формате Best of 3 (до двух побед). Финал — Best of 5.' },
                  { q: 'Выбор карт', a: 'Карты выбираются методом вычеркивания (бан/пик) перед началом каждого матча.' },
                  { q: 'Дисциплина', a: 'Опоздание на матч более чем на 10 минут карается техническим поражением.' },
                  { q: 'Честная игра', a: 'Использование любых сторонних программ или багов игры запрещено.' },
                ].map((rule, i) => (
                  <div key={i} className="p-8 bg-white border border-black/5 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black">{i + 1}</div>
                      <h3 className="text-xl font-black tracking-tight">{rule.q}</h3>
                    </div>
                    <p className="text-black/60 font-medium leading-relaxed pl-12">
                      {rule.a}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-black text-white rounded-[40px] text-center space-y-6">
                <ShieldCheck className="w-12 h-12 mx-auto text-white/20" />
                <h3 className="text-2xl font-black uppercase tracking-tight">Остались вопросы?</h3>
                <p className="opacity-60 font-medium">Свяжитесь с организаторами в Discord канале сервера.</p>
                <button className="px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">
                  Перейти в Discord
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Trophy className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tighter uppercase">BRAWL RU TOURNAMENT</span>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-30">
          <a href="#" className="hover:opacity-100 transition-opacity">Twitter</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Discord</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Twitch</a>
        </div>
        <div className="text-[10px] font-bold opacity-20 tracking-[3px] uppercase">
          PROD BY BANWORLD
        </div>
      </footer>
    </div>
  );
}
