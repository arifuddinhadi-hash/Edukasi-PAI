import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Download,
  Printer,
  Plus,
  Trash2,
  Search,
  Filter,
  Eye,
  FileText,
  ChevronRight,
  ShieldCheck,
  Share2,
  Zap,
  Flame,
  Star,
  Users,
  Save,
  RefreshCw,
  ExternalLink,
  Info,
  Maximize2,
  Check
} from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { Siswa, Pengaturan, AktivitasMuridSolatJumat } from "../types";
import { 
  subscribeCollection, 
  saveDocument, 
  deleteDocument, 
  batchSaveDocuments,
  getCurrentUserUid, 
  COLLECTIONS 
} from "../lib/firebase";

// Generated image assets
const HERO_IMAGE = "/src/assets/images/hero_solat_jumat_1794381565321.jpg";
const GOKU_IMAGE = "/src/assets/images/dragon_ball_goku_aura_1794381565728.jpg";
const SHENRON_IMAGE = "/src/assets/images/shenron_dragon_balls_1794381566977.jpg";
const POSTER_IMAGE = "/src/assets/images/poster_solat_jumat_1794381566855.jpg";

interface MediaSolatJumatViewProps {
  siswaList: Siswa[];
  config: Pengaturan;
}

// Sound Synthesizer via Web Audio API (No external sound files required)
function playSynthSound(type: 'ki_charge' | 'correct' | 'wrong' | 'dragon_ball' | 'victory' | 'tick' | 'kamehameha') {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'correct' || type === 'dragon_ball') {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.3);
      });
    } else if (type === 'ki_charge') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'kamehameha') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'victory') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    }
  } catch (err) {
    console.debug("Web audio not supported", err);
  }
}

// Dragon Ball Challenge Questions (7 Tantangan Mengumpulkan 7 Bola Naga)
const DRAGON_BALL_QUESTIONS = [
  {
    ballNumber: 1,
    title: "Bola Naga Bintang 1: Hukum Dasar Salat Jumat",
    scenario: "Goku memulai latihan fikih di serambi masjid. Apa hukum melaksanakan salat Jumat bagi seorang laki-laki muslim yang sudah baligh, berakal, sehat, dan mukim (menetap)?",
    options: [
      { id: "A", text: "Fardhu Kifayah (cukup diwakilkan sebagian orang)", correct: false },
      { id: "B", text: "Fardhu 'Ain (kewajiban mutlak setiap individu muslim laki-laki)", correct: true },
      { id: "C", text: "Sunnah Mu'akkadah (sangat dianjurkan tetapi tidak wajib)", correct: false },
      { id: "D", text: "Mubah (boleh dilakukan boleh ditinggalkan)", correct: false }
    ],
    explanation: "Hukum salat Jumat adalah Fardhu 'Ain bagi setiap laki-laki muslim yang baligh, berakal, merdeka, sehat, dan mukim berdasarkan QS. Al-Jumu'ah ayat 9 serta hadis Rasulullah SAW."
  },
  {
    ballNumber: 2,
    title: "Bola Naga Bintang 2: Syarat Wajib vs Syarat Sah",
    scenario: "Goku melihat beberapa jamaah di masjid. Manakah di antara berikut yang merupakan SYARAT SAH salat Jumat (bukan syarat wajib)?",
    options: [
      { id: "A", text: "Laki-laki (bukan perempuan)", correct: false },
      { id: "B", text: "Baligh dan berakal sehat", correct: false },
      { id: "C", text: "Dilaksanakan secara berjamaah dan didahului dua khutbah pada waktu Zuhur", correct: true },
      { id: "D", text: "Merdeka (bukan hamba sahaya)", correct: false }
    ],
    explanation: "Syarat sah salat Jumat meliputi: dilaksanakan pada waktu Zuhur, di suatu tempat permukiman, dilakukan secara berjamaah, serta didahului oleh dua khutbah."
  },
  {
    ballNumber: 3,
    title: "Bola Naga Bintang 3: Rukun Khutbah Jumat",
    scenario: "Khatib berdiri di atas mimbar. Berapakah jumlah rukun dua khutbah Jumat menurut mazhab Imam Syafi'i yang harus dipenuhi agar khutbah sah?",
    options: [
      { id: "A", text: "3 rukun (Hamdalah, Shalawat, dan Doa)", correct: false },
      { id: "B", text: "5 rukun (Hamdalah, Shalawat, Wasiat Takwa, Ayat Al-Qur'an, Doa Mukminin)", correct: true },
      { id: "C", text: "7 rukun lengkap", correct: false },
      { id: "D", text: "2 rukun saja", correct: false }
    ],
    explanation: "Rukun dua khutbah ada 5: (1) Memuji Allah (Hamdalah), (2) Bershalawat kepada Nabi SAW, (3) Berwasiat takwa, (4) Membaca ayat Al-Qur'an pada salah satu khutbah, (5) Berdoa untuk kaum mukminin di khutbah kedua."
  },
  {
    ballNumber: 4,
    title: "Bola Naga Bintang 4: Amalan Sunnah Hari Jumat",
    scenario: "Sebelum berangkat ke masjid, Goku ingin menyempurnakan amalan sunnah hari Jumat. Manakah kombinasi sunnah hari Jumat yang paling tepat?",
    options: [
      { id: "A", text: "Mandi Jumat, memakai pakaian putih bersih, memakai wewangian, dan memotong kuku", correct: true },
      { id: "B", text: "Tidur siang sampai waktu adzan Jumat berkumandang", correct: false },
      { id: "C", text: "Makan makanan berbau menyengat seperti bawang mentah", correct: false },
      { id: "D", text: "Berbicara keras-keras bersama teman di dalam masjid", correct: false }
    ],
    explanation: "Sunnah hari Jumat yang dicontohkan Rasulullah SAW: mandi besar Jumat, membersihkan diri, bersiwak/sikat gigi, memakai pakaian terbaik (putih), memakai wewangian (bagi laki-laki), dan memotong kuku."
  },
  {
    ballNumber: 5,
    title: "Bola Naga Bintang 5: Adab Khutbah & Larangan Berbicara",
    scenario: "Saat khatib sedang berkhutbah, Goku melihat temannya berbisik. Jika ada seseorang menegur temannya dengan berkata 'Diamlah!', apa status amalan Jumat orang penegur tersebut menurut hadis riwayat Bukhari & Muslim?",
    options: [
      { id: "A", text: "Mendapat pahala berlipat ganda karena menegur kemungkaran", correct: false },
      { id: "B", text: "Ibadah Jumatnya menjadi lagha (sia-sia pahalanya) karena berbicara saat khutbah", correct: true },
      { id: "C", text: "Salat Jumatnya batal dan wajib pulang", correct: false },
      { id: "D", text: "Wajib membayar denda (dam) seekor kambing", correct: false }
    ],
    explanation: "Rasulullah SAW bersabda: 'Jika engkau berkata kepada saudaramu pada hari Jumat 'Diamlah!', padahal imam sedang berkhutbah, maka sungguh engkau telah berbuat sia-sia (lagha)'. (HR. Bukhari & Muslim)."
  },
  {
    ballNumber: 6,
    title: "Bola Naga Bintang 6: Ketentuan Masbuk Salat Jumat",
    scenario: "Gohan datang terlambat dan mendapati imam sedang ruku' pada rakaat kedua salat Jumat. Apakah Gohan masih mendapatkan salat Jumat?",
    options: [
      { id: "A", text: "Ya, Gohan mendapati 1 rakaat penuh, sehingga setelah imam salam ia cukup menambah 1 rakaat lagi", correct: true },
      { id: "B", text: "Tidak, Gohan harus menyempurnakan menjadi 4 rakaat salat Zuhur", correct: false },
      { id: "C", text: "Gohan harus salat Jumat sendirian dari awal", correct: false },
      { id: "D", text: "Gohan tidak sah salatnya sama sekali", correct: false }
    ],
    explanation: "Barangsiapa mendapati minimal satu rakaat bersama imam (sempat ruku' bersama imam pada rakaat kedua), maka ia telah mendapati salat Jumat dan cukup menyempurnakan satu rakaat lagi setelah salam."
  },
  {
    ballNumber: 7,
    title: "Bola Naga Bintang 7: Dalil Al-Qur'an Perintah Salat Jumat",
    scenario: "Surah dan ayat berapakah di dalam Al-Qur'an yang memerintahkan orang-orang beriman untuk bersegera mengingat Allah saat adzan Jumat dan meninggalkan jual beli?",
    options: [
      { id: "A", text: "Surah Al-Baqarah ayat 183", correct: false },
      { id: "B", text: "Surah Al-Ikhlas ayat 1-4", correct: false },
      { id: "C", text: "Surah Al-Jumu'ah ayat 9-10", correct: true },
      { id: "D", text: "Surah Al-Ma'un ayat 1-7", correct: false }
    ],
    explanation: "QS. Al-Jumu'ah [62]: 9: 'Wahai orang-orang yang beriman! Apabila telah diseru untuk melaksanakan salat pada hari Jumat, maka segeralah kamu mengingat Allah dan tinggalkanlah jual beli. Yang demikian itu lebih baik bagimu jika kamu mengetahui.'"
  }
];

// LKPD Questions with 30-Second Countdown (Kasus Nyata Kelas 5 SD)
const LKPD_ITEMS = [
  {
    id: 1,
    title: "Studi Kasus 1: Panggilan Adzan & Permainan",
    situation: "Faris sedang asyik bermain gim sepak bola di ponselnya saat hari Jumat pukul 12.00. Tiba-tiba terdengar kumandang adzan Jumat pertama dari masjid dekat rumahnya.",
    question: "Tindakan apa yang paling tepat dan berakhlak mulia dilakukan Faris menurut QS. Al-Jumu'ah ayat 9?",
    options: [
      { id: "A", text: "Menyelesaikan gim terlebih dahulu sampai tamat baru bersiap", correct: false },
      { id: "B", text: "Segera mematikan gim, mengambil wudhu/mandi, berpakaian rapi, dan berangkat ke masjid", correct: true },
      { id: "C", text: "Mengabaikan adzan karena salat Jumat bisa diganti salat Zuhur di rumah", correct: false },
      { id: "D", text: "Membawa ponsel ke masjid dan bermain game di saf paling belakang", correct: false }
    ],
    hint: "Kunci: Perintah 'Tinggalkanlah jual beli dan urusan duniawi untuk bersegera mengingat Allah'."
  },
  {
    id: 2,
    title: "Studi Kasus 2: Adab Mendengarkan Dua Khutbah",
    situation: "Saat khatib sedang menyampaikan wasiat takwa di atas mimbar, Farhan melihat sandal temannya terinjak orang lain di luar serambi. Farhan menepuk pundak temannya dan bercerita.",
    question: "Bagaimana hukum perbuatan Farhan saat khutbah berlangsung?",
    options: [
      { id: "A", text: "Boleh asalkan suaranya pelan dan tidak terdengar khatib", correct: false },
      { id: "B", text: "Haram/makruh tahrim serta menghilangkan pahala utama ibadah Jumat (lagha)", correct: true },
      { id: "C", text: "Sunnah karena membantu memberi tahu informasi penting", correct: false },
      { id: "D", text: "Mubah tidak ada pengaruh sama sekali pada ibadah", correct: false }
    ],
    hint: "Kunci: Rasulullah melarang segala bentuk obrolan dan perkataan saat khatib berkhutbah."
  },
  {
    id: 3,
    title: "Studi Kasus 3: Kategori Orang yang Diberi Keringanan (Udzur)",
    situation: "Paman Budi sedang sakit demam tinggi dan terbaring di tempat tidur rumah sakit saat tiba waktu salat Jumat.",
    question: "Apakah Paman Budi berdosa karena tidak pergi salat Jumat ke masjid?",
    options: [
      { id: "A", text: "Berdosa besar karena salat Jumat wajib bagi semua orang tanpa kecuali", correct: false },
      { id: "B", text: "Tidak berdosa, karena sakit parah termasuk udzur syar'i dan ia wajib menggantinya dengan salat Zuhur 4 rakaat", correct: true },
      { id: "C", text: "Tidak berdosa dan tidak perlu salat Zuhur sama sekali", correct: false },
      { id: "D", text: "Berdosa kecuali membayar fidyah beras", correct: false }
    ],
    hint: "Kunci: Udzur syar'i salat Jumat antara lain sakit, musafir, wanita, dan anak yang belum baligh."
  },
  {
    id: 4,
    title: "Studi Kasus 4: Urutan Tata Cara Pelaksanaan Salat Jumat",
    situation: "Zahra dan teman-temannya sedang menyusun urutan ibadah Jumat di madrasah.",
    question: "Urutkan tahapan pelaksanaan salat Jumat yang benar setelah masuk waktu!",
    options: [
      { id: "A", text: "Salat 2 rakaat -> Khutbah pertama -> Khutbah kedua -> Adzan", correct: false },
      { id: "B", text: "Adzan -> Khutbah Pertama -> Duduk di antara 2 Khutbah -> Khutbah Kedua -> Iqamah -> Salat 2 Rakaat Berjamaah", correct: true },
      { id: "C", text: "Adzan -> Salat 4 Rakaat -> Khutbah -> Pulang", correct: false },
      { id: "D", text: "Khutbah -> Adzan -> Salat Zuhur biasa", correct: false }
    ],
    hint: "Kunci: Didahului dua khutbah yang dipisah dengan duduk sejenak, lalu salat 2 rakaat berjamaah."
  },
  {
    id: 5,
    title: "Studi Kasus 5: Hikmah dan Nilai Sosial Salat Jumat",
    situation: "Salat Jumat mempertemukan seluruh warga muslim dari berbagai latar belakang, status ekonomi, dan profesi dalam satu shaf yang sejajar di hadapan Allah SWT.",
    question: "Nilai Profil Pelajar Pancasila dan hikmah utama apa yang tercermin dari peristiwa ini?",
    options: [
      { id: "A", text: "Gotong royong, persatuan ukhuwah islamiyah, dan kesetaraan derajat manusia", correct: true },
      { id: "B", text: "Menonjolkan perbedaan kasta dan kekayaan antar jamaah", correct: false },
      { id: "C", text: "Mencari keuntungan materi dan persaingan bisnis", correct: false },
      { id: "D", text: "Memamerkan pakaian mewah kepada tetangga", correct: false }
    ],
    hint: "Kunci: Salat Jumat adalah wadah silaturahmi akbar dan mempererat ukhuwah serta persatuan umat."
  }
];

// Asesmen Sumatif Kurikulum Merdeka (10 Soal Pilihan Standar KKTP)
const SUMATIF_QUESTIONS = [
  {
    no: 1,
    q: "Salat Jumat dilaksanakan pada hari Jumat sebanyak dua rakaat secara berjamaah pada waktu...",
    options: ["Subuh", "Zuhur", "Ashar", "Maghrib"],
    ans: 1,
    pembahasan: "Salat Jumat dilaksanakan pada waktu Zuhur menggantikan salat Zuhur 4 rakaat bagi yang melaksanakannya."
  },
  {
    no: 2,
    q: "Hukum melaksanakan salat Jumat bagi wanita, anak-anak yang belum baligh, dan orang sakit adalah...",
    options: ["Wajib 'Ain", "Fardhu Kifayah", "Tidak wajib (boleh salat Zuhur)", "Haram"],
    ans: 2,
    pembahasan: "Wanita, hamba sahaya, anak-anak, dan orang sakit tidak diwajibkan salat Jumat, tetapi wajib melaksanakan salat Zuhur."
  },
  {
    no: 3,
    q: "Ayat Al-Qur'an yang menjelaskan anjuran bersegera melaksanakan salat Jumat adalah...",
    options: ["QS. Al-Baqarah ayat 43", "QS. Al-Jumu'ah ayat 9", "QS. An-Nur ayat 35", "QS. Al-Kautsar ayat 2"],
    ans: 1,
    pembahasan: "QS. Al-Jumu'ah ayat 9 secara khusus menegaskan perintah memenuhi seruan adzan Jumat."
  },
  {
    no: 4,
    q: "Berikut ini yang BUKAN termasuk rukun dua khutbah Jumat adalah...",
    options: ["Membaca puji-pujian kepada Allah (Hamdalah)", "Membaca shalawat kepada Nabi Muhammad SAW", "Bercerita pengalaman liburan pribadi khatib", "Mewasiatkan ketakwaan kepada jamaah"],
    ans: 2,
    pembahasan: "Cerita liburan pribadi bukanlah rukun khutbah. Rukun khutbah adalah hamdalah, shalawat, wasiat takwa, ayat Al-Qur'an, dan doa."
  },
  {
    no: 5,
    q: "Sunnah yang dianjurkan dilakukan pada pagi hari Jumat sebelum berangkat ke masjid adalah...",
    options: ["Mandi sunnah Jumat dan memotong kuku", "Tidur sampai siang hari", "Makan makanan yang memicu bau mulut", "Memakai pakaian kotor bekas berolahraga"],
    ans: 0,
    pembahasan: "Mandi Jumat, memotong kuku, dan bersiwak sangat dianjurkan agar tubuh bersih dan harum saat beribadah bersama."
  },
  {
    no: 6,
    q: "Jumlah rakaat salat Jumat yang dilakukan secara berjamaah adalah...",
    options: ["1 Rakaat", "2 Rakaat", "3 Rakaat", "4 Rakaat"],
    ans: 1,
    pembahasan: "Salat Jumat dikerjakan sebanyak 2 rakaat dipimpin oleh seorang imam dengan bacaan yang dikeraskan (jahr)."
  },
  {
    no: 7,
    q: "Batas waktu seseorang masih dianggap mendapatkan salat Jumat bersama imam adalah apabila sempat...",
    options: ["Mendapati ruku' pada rakaat kedua", "Mendapati tahiyyat akhir saja", "Mendengar salam imam", "Melihat imam turun dari mimbar"],
    ans: 0,
    pembahasan: "Jika sempat ruku' pada rakaat kedua bersama imam, ia mendapatkan salat Jumat dan cukup menambah 1 rakaat setelah imam salam."
  },
  {
    no: 8,
    q: "Surah di dalam Al-Qur'an yang sangat dianjurkan untuk dibaca pada malam dan siang hari Jumat adalah...",
    options: ["Surah Al-Kahfi", "Surah Yasin", "Surah Al-Waqi'ah", "Surah Al-Mulk"],
    ans: 0,
    pembahasan: "Hadis shahih meriwayatkan bahwa siapa yang membaca Surah Al-Kahfi pada hari Jumat akan disinari cahaya antara dua Jumat."
  },
  {
    no: 9,
    q: "Sikap yang benar ketika khatib sedang menyampaikan khutbah di atas mimbar adalah...",
    options: ["Mendengarkan dengan tenang, khusyuk, dan tidak berbicara", "Bermain game di ponsel tanpa suara", "Mengobrol berbisik-bisik dengan teman", "Tidur nyenyak sampai iqamah"],
    ans: 0,
    pembahasan: "Mendengarkan khutbah dengan khusyuk adalah kewajiban adab mendengarkan khutbah."
  },
  {
    no: 10,
    q: "Setelah selesai salat Jumat, umat Islam dianjurkan untuk...",
    options: ["Berdiam diri tanpa bergerak", "Berdzikir, berdoa, lalu bertebaran di muka bumi mencari karunia Allah", "Tidur seharian", "Meninggalkan pekerjaan untuk selamanya"],
    ans: 1,
    pembahasan: "QS. Al-Jumu'ah ayat 10: 'Apabila salat telah dilaksanakan, maka bertebaranlah kamu di bumi; carilah karunia Allah dan ingatlah Allah banyak-banyak supaya kamu beruntung.'"
  }
];

export const MediaSolatJumatView: React.FC<MediaSolatJumatViewProps> = ({
  siswaList,
  config
}) => {
  // Navigation Tabs: cp_tp, materi, dragon_ball, lkpd_timer, sumatif, poster, monitoring_sheet
  const [activeTab, setActiveTab] = useState<
    'cp_tp' | 'materi' | 'dragon_ball' | 'lkpd_timer' | 'sumatif' | 'poster' | 'monitoring_sheet'
  >('materi');

  // Text to Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9); // Ramah anak SD
  const [activeVoiceSnippet, setActiveVoiceSnippet] = useState<string>("");

  // Dragon Ball Game State
  const [currentDbIndex, setCurrentDbIndex] = useState(0);
  const [collectedDragonBalls, setCollectedDragonBalls] = useState<number[]>([]);
  const [kiEnergy, setKiEnergy] = useState<number>(10);
  const [selectedDbOption, setSelectedDbOption] = useState<string | null>(null);
  const [dbFeedback, setDbFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isShenronSummoned, setIsShenronSummoned] = useState(false);
  const [isKamehamehaActive, setIsKamehamehaActive] = useState(false);

  // LKPD 30-Second Timer State
  const [lkpdIndex, setLkpdIndex] = useState(0);
  const [lkpdTimer, setLkpdTimer] = useState<number>(30);
  const [isLkpdTimerRunning, setIsLkpdTimerRunning] = useState<boolean>(false);
  const [lkpdSelectedOption, setLkpdSelectedOption] = useState<string | null>(null);
  const [lkpdAnswers, setLkpdAnswers] = useState<Record<number, { selected: string; isCorrect: boolean; timeUsed: number }>>({});
  const [isLkpdFinished, setIsLkpdFinished] = useState<boolean>(false);

  // Asesmen Sumatif State
  const [sumatifAnswers, setSumatifAnswers] = useState<Record<number, number>>({});
  const [isSumatifSubmitted, setIsSumatifSubmitted] = useState(false);

  // Poster Modal View
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  // Monitoring Sheet State (Sync with Firebase or Local)
  const [aktivitasList, setAktivitasList] = useState<AktivitasMuridSolatJumat[]>([]);
  const [searchMuridQuery, setSearchMuridQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddMuridModalOpen, setIsAddMuridModalOpen] = useState(false);
  const [currentUid, setCurrentUid] = useState<string>(() => getCurrentUserUid());

  // Form tambah data aktivitas murid
  const [formNamaMurid, setFormNamaMurid] = useState("");
  const [formKelasMurid, setFormKelasMurid] = useState("V A");
  const [formNisnMurid, setFormNisnMurid] = useState("");
  const [formSkorDragonBall, setFormSkorDragonBall] = useState(100);
  const [formSkorLkpd, setFormSkorLkpd] = useState(85);
  const [formSkorSumatif, setFormSkorSumatif] = useState(90);
  const [formCatatan, setFormCatatan] = useState("Sangat aktif, tuntas menguasai rukun dan tata cara salat Jumat.");

  // Speech Synthesis helper
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      Swal.fire({
        icon: "info",
        title: "Audio Browser",
        text: "Perangkat Anda belum mendukung Web Speech Synthesis suara otomatis.",
        confirmButtonColor: "#059669"
      });
      return;
    }

    window.speechSynthesis.cancel();

    if (isPlayingAudio && activeVoiceSnippet === text) {
      setIsPlayingAudio(false);
      setActiveVoiceSnippet("");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = speechRate;
    utterance.pitch = 1.05;

    // Pick Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indoVoice = voices.find(v => v.lang.includes("id") || v.lang.includes("ID"));
    if (indoVoice) utterance.voice = indoVoice;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setActiveVoiceSnippet(text);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveVoiceSnippet("");
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveVoiceSnippet("");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setActiveVoiceSnippet("");
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // LKPD 30-Second Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isLkpdTimerRunning && lkpdTimer > 0) {
      interval = setInterval(() => {
        setLkpdTimer((prev) => {
          if (prev <= 5 && prev > 1) {
            playSynthSound('tick');
          }
          if (prev <= 1) {
            // Time out auto submit
            playSynthSound('wrong');
            handleLkpdTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (lkpdTimer === 0) {
      setIsLkpdTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isLkpdTimerRunning, lkpdTimer, lkpdIndex]);

  const handleLkpdTimeOut = () => {
    setIsLkpdTimerRunning(false);
    const curr = LKPD_ITEMS[lkpdIndex];
    if (!lkpdAnswers[curr.id]) {
      setLkpdAnswers((prev) => ({
        ...prev,
        [curr.id]: {
          selected: lkpdSelectedOption || "TIDAK_MENJAWAB",
          isCorrect: false,
          timeUsed: 30
        }
      }));
    }
    Swal.fire({
      icon: "warning",
      title: "Waktu 30 Detik Habis!",
      text: "Waktu pengerjaan untuk soal ini telah selesai. Ayo lanjut ke tantangan berikutnya!",
      confirmButtonText: "Lanjut",
      confirmButtonColor: "#059669"
    });
  };

  const startNextLkpdQuestion = (nextIdx: number) => {
    if (nextIdx < LKPD_ITEMS.length) {
      setLkpdIndex(nextIdx);
      setLkpdTimer(30);
      setLkpdSelectedOption(null);
      setIsLkpdTimerRunning(true);
    } else {
      setIsLkpdFinished(true);
      setIsLkpdTimerRunning(false);
      playSynthSound('victory');
    }
  };

  const submitLkpdAnswer = (optionId: string) => {
    if (lkpdAnswers[LKPD_ITEMS[lkpdIndex].id]) return; // already answered
    setLkpdSelectedOption(optionId);
    const currentQuestion = LKPD_ITEMS[lkpdIndex];
    const isCorrect = currentQuestion.options.find(o => o.id === optionId)?.correct || false;
    const timeUsed = 30 - lkpdTimer;

    setIsLkpdTimerRunning(false);

    if (isCorrect) {
      playSynthSound('correct');
    } else {
      playSynthSound('wrong');
    }

    setLkpdAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selected: optionId,
        isCorrect,
        timeUsed
      }
    }));
  };

  // Dragon Ball Answer Handler
  const handleAnswerDragonBall = (optionId: string) => {
    if (selectedDbOption) return; // Prevent double answer
    setSelectedDbOption(optionId);
    const currentQ = DRAGON_BALL_QUESTIONS[currentDbIndex];
    const optionObj = currentQ.options.find(o => o.id === optionId);
    const isCorrect = Boolean(optionObj?.correct);

    if (isCorrect) {
      playSynthSound('dragon_ball');
      setIsKamehamehaActive(true);
      setTimeout(() => setIsKamehamehaActive(false), 900);

      // Collect ball if not yet collected
      if (!collectedDragonBalls.includes(currentQ.ballNumber)) {
        setCollectedDragonBalls((prev) => [...prev, currentQ.ballNumber]);
        setKiEnergy((prev) => Math.min(100, prev + 15));
      }

      setDbFeedback({
        isCorrect: true,
        text: `Jawaban Tepat! Goku melancarkan Ki Kamehameha Fikih dan berhasil mengamankan Bola Naga Bintang ${currentQ.ballNumber}!`
      });

      // If all 7 collected
      if (collectedDragonBalls.length + 1 >= 7) {
        setTimeout(() => {
          setIsShenronSummoned(true);
          playSynthSound('victory');
        }, 1200);
      }
    } else {
      playSynthSound('wrong');
      setDbFeedback({
        isCorrect: false,
        text: `Kurang tepat. ${currentQ.explanation}`
      });
    }
  };

  const nextDragonBallQuestion = () => {
    setSelectedDbOption(null);
    setDbFeedback(null);
    if (currentDbIndex < DRAGON_BALL_QUESTIONS.length - 1) {
      setCurrentDbIndex((prev) => prev + 1);
    }
  };

  const resetDragonBallGame = () => {
    setCurrentDbIndex(0);
    setCollectedDragonBalls([]);
    setKiEnergy(10);
    setSelectedDbOption(null);
    setDbFeedback(null);
    setIsShenronSummoned(false);
  };

  // Subscribe to real-time monitoring sheet from Firebase
  useEffect(() => {
    const uid = getCurrentUserUid();
    setCurrentUid(uid);

    const unsub = subscribeCollection<AktivitasMuridSolatJumat>(
      COLLECTIONS.AKTIVITAS_SOLAT_JUMAT,
      (data) => {
        if (data && data.length > 0) {
          setAktivitasList(data);
        } else {
          // Pre-populate with class students if available
          const sampleData: AktivitasMuridSolatJumat[] = siswaList.length > 0 
            ? siswaList.slice(0, 5).map((s, idx) => ({
                id: `act_${s.id || idx}`,
                idSiswa: s.id,
                namaSiswa: s.nama,
                kelas: s.kelas || "V A",
                nisn: s.nisn || `001234567${idx}`,
                tanggal: new Date().toISOString().split("T")[0],
                waktu: "10:15 WIB",
                materiSelesai: true,
                skorGameDragonBall: 100,
                skorLkpd30s: 85 + (idx % 3) * 5,
                skorSumatif: 90 - (idx % 2) * 5,
                nilaiAkhir: Math.round((100 + 85 + 90) / 3),
                statusKetuntasan: 'Tuntas',
                catatanGuru: "Sangat antusias mengumpulkan 7 Bola Naga dan disiplin pada timer LKPD 30 detik."
              }))
            : [
                {
                  id: "act_101",
                  namaSiswa: "Ahmad Fadhil Ar-Razi",
                  kelas: "V A",
                  nisn: "0014529811",
                  tanggal: new Date().toISOString().split("T")[0],
                  waktu: "09:30 WIB",
                  materiSelesai: true,
                  skorGameDragonBall: 100,
                  skorLkpd30s: 90,
                  skorSumatif: 95,
                  nilaiAkhir: 95,
                  statusKetuntasan: 'Tuntas',
                  catatanGuru: "Menguasai 5 rukun khutbah dan tertib mengikuti timer 30 detik LKPD."
                },
                {
                  id: "act_102",
                  namaSiswa: "Siti Maryam Az-Zahra",
                  kelas: "V A",
                  nisn: "0014529812",
                  tanggal: new Date().toISOString().split("T")[0],
                  waktu: "09:45 WIB",
                  materiSelesai: true,
                  skorGameDragonBall: 85,
                  skorLkpd30s: 80,
                  skorSumatif: 88,
                  nilaiAkhir: 84,
                  statusKetuntasan: 'Tuntas',
                  catatanGuru: "Mampu menjelaskan adab saat khatib berkhutbah dengan tepat."
                },
                {
                  id: "act_103",
                  namaSiswa: "Muhammad Rayhan Pratama",
                  kelas: "V B",
                  nisn: "0014529813",
                  tanggal: new Date().toISOString().split("T")[0],
                  waktu: "10:00 WIB",
                  materiSelesai: true,
                  skorGameDragonBall: 100,
                  skorLkpd30s: 100,
                  skorSumatif: 92,
                  nilaiAkhir: 97,
                  statusKetuntasan: 'Tuntas',
                  catatanGuru: "Lulus tantangan Shenron 7 Bola Naga dengan sempurna."
                }
              ];
          setAktivitasList(sampleData);
        }
      },
      uid
    );

    return () => unsub();
  }, [siswaList]);

  // Export Monitoring Sheet to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const dataToExport = filteredAktivitas.map((item, index) => ({
        "No": index + 1,
        "Nama Siswa": item.namaSiswa,
        "NISN": item.nisn || "-",
        "Kelas": item.kelas,
        "Tanggal": item.tanggal,
        "Waktu": item.waktu,
        "Progres Materi": item.materiSelesai ? "Selesai (100%)" : "Belum",
        "Skor Game Dragon Ball": item.skorGameDragonBall,
        "Skor LKPD (Timer 30s)": item.skorLkpd30s,
        "Skor Asesmen Sumatif": item.skorSumatif,
        "Nilai Akhir": item.nilaiAkhir,
        "Status Ketuntasan": item.statusKetuntasan,
        "Catatan Guru": item.catatanGuru
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Aktivitas_Solat_Jumat");
      XLSX.writeFile(wb, `Rekap_Aktivitas_Solat_Jumat_Kelas5_${new Date().toISOString().split("T")[0]}.xlsx`);

      Swal.fire({
        icon: "success",
        title: "Export Berhasil!",
        text: "File Rekap Excel berhasil diunduh ke perangkat Anda.",
        confirmButtonColor: "#059669"
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal Export",
        text: err.message || "Terjadi kesalahan saat mengekspor data ke Excel.",
        confirmButtonColor: "#059669"
      });
    }
  };

  // Print Monitoring Sheet
  const handlePrintSheet = () => {
    window.print();
  };

  // Add Murid Activity to Firestore
  const handleSaveMuridActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaMurid.trim()) {
      Swal.fire({ icon: "warning", title: "Nama Siswa Wajib Diisi", confirmButtonColor: "#059669" });
      return;
    }

    const calculatedNilai = Math.round((formSkorDragonBall + formSkorLkpd + formSkorSumatif) / 3);
    const statusKetuntasan = calculatedNilai >= 75 ? "Tuntas" : "Perlu Bimbingan";

    const newRecord: AktivitasMuridSolatJumat = {
      id: `act_${Date.now()}`,
      namaSiswa: formNamaMurid.trim(),
      kelas: formKelasMurid,
      nisn: formNisnMurid.trim() || "-",
      tanggal: new Date().toISOString().split("T")[0],
      waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      materiSelesai: true,
      skorGameDragonBall: Number(formSkorDragonBall),
      skorLkpd30s: Number(formSkorLkpd),
      skorSumatif: Number(formSkorSumatif),
      nilaiAkhir: calculatedNilai,
      statusKetuntasan,
      catatanGuru: formCatatan.trim() || "Mengikuti pembelajaran media solat jumat.",
      updatedAt: Date.now()
    };

    try {
      await saveDocument(COLLECTIONS.AKTIVITAS_SOLAT_JUMAT, newRecord.id, newRecord, currentUid);
      setAktivitasList((prev) => [newRecord, ...prev.filter(i => i.id !== newRecord.id)]);
      setIsAddMuridModalOpen(false);
      setFormNamaMurid("");
      setFormNisnMurid("");

      Swal.fire({
        icon: "success",
        title: "Data Berhasil Disimpan",
        text: `Aktivitas belajar ananda ${newRecord.namaSiswa} telah dicatat di Sheet Pemantauan.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err.message,
        confirmButtonColor: "#059669"
      });
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string, name: string) => {
    const res = await Swal.fire({
      title: "Hapus Catatan Siswa?",
      text: `Apakah Anda yakin ingin menghapus catatan aktivitas ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (res.isConfirmed) {
      try {
        await deleteDocument(COLLECTIONS.AKTIVITAS_SOLAT_JUMAT, id, currentUid);
        setAktivitasList((prev) => prev.filter(item => item.id !== id));
        Swal.fire({
          icon: "success",
          title: "Terhapus",
          text: "Catatan aktivitas telah dihapus.",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err: any) {
        Swal.fire({ icon: "error", title: "Gagal Menghapus", text: err.message, confirmButtonColor: "#059669" });
      }
    }
  };

  // Calculate sumatif score
  const calculateSumatifScore = () => {
    let correct = 0;
    SUMATIF_QUESTIONS.forEach((q) => {
      if (sumatifAnswers[q.no] === q.ans) {
        correct += 1;
      }
    });
    return Math.round((correct / SUMATIF_QUESTIONS.length) * 100);
  };

  // Filtered monitoring list
  const filteredAktivitas = aktivitasList.filter((item) => {
    const matchesSearch = item.namaSiswa.toLowerCase().includes(searchMuridQuery.toLowerCase()) ||
      (item.nisn && item.nisn.includes(searchMuridQuery)) ||
      item.kelas.toLowerCase().includes(searchMuridQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || item.statusKetuntasan === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner / Hero Header - Hijau Kristal & Kuning Keemasan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/30">
        {/* Glow & Backdrop Crystal Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PAI & BUDI PEKERTI · FASE C (KELAS 5 SD)</span>
              <span className="text-emerald-300 font-extrabold">· KURIKULUM MERDEKA</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Media Pembelajaran Interaktif: <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-200">
                Ibadah Salat Jumat
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
              Eksplorasi CP & TP, dalil Al-Qur'an & hadis shahih, petualangan Game Dragon Ball 7 Bola Naga, LKPD bertimer 30 detik, serta lembar monitoring aktivitas belajar siswa.
            </p>

            {/* Quick Action / Master Audio Controls Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => speakText("Selamat datang anak-anak sholeh dan sholehah kelas lima. Hari ini kita akan belajar tentang Ibadah Salat Jumat, mulai dari pengertian, syarat wajib, rukun dua khutbah, amalan sunnah hari Jumat, petualangan seru Game Dragon Ball, dan Lembar Kerja Peserta Didik berdurasi tiga puluh detik.")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                  isPlayingAudio
                    ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40"
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                <span>{isPlayingAudio ? "Jeda / Matikan Suara" : "Dengarkan Pengantar Audio"}</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-emerald-500/30 text-xs font-semibold text-emerald-100">
                <span>Kecepatan:</span>
                {[0.8, 1.0, 1.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                      speechRate === rate ? "bg-amber-400 text-slate-950" : "hover:bg-emerald-700/50 text-emerald-200"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {isPlayingAudio && (
                <div className="flex items-center gap-1 text-xs text-amber-300 animate-pulse">
                  <span className="w-1.5 h-3 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="font-semibold text-xs ml-1">Speaker Menyala</span>
                </div>
              )}
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="shrink-0 lg:w-72 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl group">
              <img
                src={HERO_IMAGE}
                alt="Murid Berangkat Sholat Jumat"
                referrerPolicy="no-referrer"
                className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <div className="text-left">
                  <div className="text-[11px] font-bold text-amber-300">Menuju Masjid Agung</div>
                  <div className="text-xs text-white font-semibold">Sayyidul Ayyam (Hari Terbaik)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Buttons - Dominan Kuning & Hijau Kristal */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-md border border-emerald-500/20 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'materi', label: 'Bahan Bacaan & Dalil', icon: BookOpen },
          { id: 'cp_tp', label: 'CP & Tujuan Pembelajaran', icon: ShieldCheck },
          { id: 'dragon_ball', label: 'Game Dragon Ball (7 Bola)', icon: Zap, highlight: true },
          { id: 'lkpd_timer', label: 'LKPD Timer 30 Detik', icon: Clock, badge: '30s' },
          { id: 'sumatif', label: 'Asesmen Sumatif', icon: CheckCircle2 },
          { id: 'poster', label: 'Poster Edukatif', icon: FileText },
          { id: 'monitoring_sheet', label: 'Sheet Aktivitas Murid', icon: Users, badge: `${aktivitasList.length}` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                stopAudio();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                isActive
                  ? tab.highlight
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md ring-2 ring-amber-400"
                    : "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                  : "bg-slate-50 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (tab.highlight ? "text-slate-950" : "text-amber-300") : "text-emerald-600 dark:text-emerald-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? "bg-black/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: BAHAN BACAAN & DALIL AKURAT */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          {/* Header Card Dalil Al-Qur'an */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-400/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                <h2 className="text-lg sm:text-xl font-extrabold text-amber-300">
                  Dalil Al-Qur'an: QS. Al-Jumu'ah [62]: Ayat 9 - 10
                </h2>
              </div>
              <button
                onClick={() => speakText("Surah Al-Jumu'ah ayat 9. Wahai orang-orang yang beriman! Apabila telah diseru untuk melaksanakan salat pada hari Jumat, maka segeralah kamu mengingat Allah dan tinggalkanlah jual beli. Yang demikian itu lebih baik bagimu jika kamu mengetahui. Ayat 10. Apabila salat telah dilaksanakan, maka bertebaranlah kamu di bumi; carilah karunia Allah dan ingatlah Allah banyak-banyak supaya kamu beruntung.")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Bunyikan Ayat & Terjemah</span>
              </button>
            </div>

            {/* Arabic Text with Beautiful Styling */}
            <div className="bg-slate-950/60 rounded-2xl p-6 border border-emerald-500/30 text-right space-y-4">
              <p className="font-serif text-xl sm:text-2xl lg:text-3xl leading-loose text-amber-200 tracking-wide" dir="rtl">
                يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوْٓا اِذَا نُوْدِيَ لِلصَّلٰوةِ مِنْ يَّوْمِ الْجُمُعَةِ فَاسْعَوْا اِلٰى ذِكْرِ اللّٰهِ وَذَرُوا الْبَيْعَۗ ذٰلِكُمْ خَيْرٌ لَّكُمْ اِنْ كُنْتُمْ تَعْلَمُوْنَ ﴿٩﴾
              </p>
              <p className="font-serif text-xl sm:text-2xl lg:text-3xl leading-loose text-amber-200 tracking-wide" dir="rtl">
                فَاِذَا قُضِيَتِ الصَّلٰوةُ فَانْتَشِرُوْا فِى الْاَرْضِ وَابْتَغُوْا مِنْ فَضْلِ اللّٰهِ وَاذْكُرُوا اللّٰهَ كَثِيْرًا لَّعَلَّكُمْ تُفْلِحُوْنَ ﴿١٠﴾
              </p>
            </div>

            {/* Terjemahan Resmi Kemenag RI */}
            <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xs text-xs sm:text-sm text-emerald-100 leading-relaxed space-y-2">
              <p>
                <strong className="text-amber-300">Artinya (Ayat 9):</strong> "Wahai orang-orang yang beriman! Apabila telah diseru untuk melaksanakan salat pada hari Jumat, maka segeralah kamu mengingat Allah dan tinggalkanlah jual beli. Yang demikian itu lebih baik bagimu jika kamu mengetahui."
              </p>
              <p>
                <strong className="text-amber-300">Artinya (Ayat 10):</strong> "Apabila salat telah dilaksanakan, maka bertebaranlah kamu di bumi; carilah karunia Allah dan ingatlah Allah banyak-banyak supaya kamu beruntung."
              </p>
              <p className="text-[11px] text-amber-200/80 pt-1">
                Referensi: Al-Qur'an dan Terjemahannya, Kementerian Agama Republik Indonesia.
              </p>
            </div>
          </div>

          {/* 5 Kartu Fikih Salat Jumat - Dominan Hijau Kristal & Kuning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu 1: Pengertian & Hukum */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border-2 border-emerald-500/20 hover:border-emerald-500 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black">
                    1
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Pengertian & Hukum Salat Jumat
                  </h3>
                </div>
                <button
                  onClick={() => speakText("Pengertian Salat Jumat. Salat Jumat adalah salat dua rakaat yang dilaksanakan secara berjamaah pada waktu Zuhur di hari Jumat, didahului dengan dua khutbah. Hukumnya adalah Fardhu 'Ain bagi laki-laki muslim yang telah baligh, berakal sehat, merdeka, dan bermukim.")}
                  className="p-2 rounded-lg bg-emerald-50 dark:bg-slate-700 text-emerald-600 hover:bg-emerald-100"
                  title="Dengarkan Suara"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Salat Jumat adalah salat dua rakaat yang dikerjakan secara berjamaah pada waktu Zuhur setiap hari Jumat, yang didahului oleh dua khutbah.
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400">Hukum: Fardhu 'Ain</div>
                <p>Wajib atas setiap laki-laki muslim baligh, berakal, merdeka, sehat, dan mukim. Bagi wanita, anak-anak, musafir, atau orang yang sakit keras diberikan rukhshah (keringanan) untuk melaksanakan salat Zuhur 4 rakaat di rumah.</p>
              </div>
              <div className="text-[11px] text-slate-400">
                Rujukan: <em>Matan Al-Ghayah wat Taqrib</em> (Fashl Sholatil Jumu'ah) karya Al-Qadhi Abu Syuja'.
              </div>
            </div>

            {/* Kartu 2: Syarat Wajib & Syarat Sah */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border-2 border-emerald-500/20 hover:border-emerald-500 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black">
                    2
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Syarat Wajib & Syarat Sah
                  </h3>
                </div>
                <button
                  onClick={() => speakText("Syarat wajib salat Jumat meliputi Islam, baligh, berakal, laki-laki, sehat, dan mukim. Syarat sah salat Jumat meliputi dilakukan di waktu Zuhur, di perkampungan yang tetap, dilakukan secara berjamaah, dan didahului dua khutbah.")}
                  className="p-2 rounded-lg bg-amber-50 dark:bg-slate-700 text-amber-600 hover:bg-amber-100"
                  title="Dengarkan Suara"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Syarat Wajib:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li>Islam</li>
                    <li>Baligh (dewasa)</li>
                    <li>Berakal sehat</li>
                    <li>Laki-laki</li>
                    <li>Sehat jasmani</li>
                    <li>Bermukim (menetap)</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Syarat Sah:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li>Masuk waktu Zuhur</li>
                    <li>Dilakukan berjamaah</li>
                    <li>Di tempat tetap</li>
                    <li>Didahului 2 khutbah</li>
                    <li>Salat 2 rakaat berjamaah</li>
                  </ul>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Rujukan: <em>Fath al-Qarib al-Mujib</em>, Syaikh Muhammad bin Qasim al-Ghazzi.
              </div>
            </div>

            {/* Kartu 3: 5 Rukun Khutbah Jumat */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border-2 border-emerald-500/20 hover:border-emerald-500 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black">
                    3
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    5 Rukun Dua Khutbah Jumat
                  </h3>
                </div>
                <button
                  onClick={() => speakText("Lima rukun khutbah Jumat menurut mazhab Syafi'i. Satu, memuji Allah atau Hamdalah pada kedua khutbah. Dua, membaca shalawat kepada Nabi Muhammad SAW pada kedua khutbah. Tiga, berwasiat ketakwaan kepada Allah pada kedua khutbah. Empat, membaca sekurang-kurangnya satu ayat suci Al-Qur'an pada salah satu khutbah. Lima, mendoakan kaum mukminin dan mukminat pada khutbah kedua.")}
                  className="p-2 rounded-lg bg-emerald-50 dark:bg-slate-700 text-emerald-600 hover:bg-emerald-100"
                  title="Dengarkan Suara"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <li><strong className="text-emerald-700 dark:text-emerald-400">Memuji Allah (Hamdalah)</strong> pada khutbah 1 & 2.</li>
                <li><strong className="text-emerald-700 dark:text-emerald-400">Membaca Shalawat Nabi</strong> kepada Rasulullah SAW pada kedua khutbah.</li>
                <li><strong className="text-emerald-700 dark:text-emerald-400">Wasiat Takwa</strong> mengajak taat kepada perintah Allah pada kedua khutbah.</li>
                <li><strong className="text-emerald-700 dark:text-emerald-400">Membaca Ayat Al-Qur'an</strong> yang memberi pengertian jelas pada salah satu khutbah.</li>
                <li><strong className="text-emerald-700 dark:text-emerald-400">Mendoakan Kaum Mukminin</strong> dan mukminat pada khutbah kedua.</li>
              </ol>
            </div>

            {/* Kartu 4: Amalan Sunnah Hari Jumat */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border-2 border-emerald-500/20 hover:border-emerald-500 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black">
                    4
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    6 Amalan Sunnah Emas Hari Jumat
                  </h3>
                </div>
                <button
                  onClick={() => speakText("Enam amalan sunnah hari Jumat. Mandi sunnah Jumat, memakai pakaian bersih berwarna putih, memakai wangi-wangian bagi laki-laki, memotong kuku dan bersiwak, datang awal ke masjid, serta membaca Surah Al-Kahfi dan memperbanyak shalawat.")}
                  className="p-2 rounded-lg bg-amber-50 dark:bg-slate-700 text-amber-600 hover:bg-amber-100"
                  title="Dengarkan Suara"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold">✨ Mandi Sunnah Jumat</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">Menyegarkan tubuh sebelum pergi ke masjid (HR. Bukhari).</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                  <div className="font-bold">👔 Pakaian Putih Bersih</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">Pakaian terbaik yang disukai Rasulullah SAW.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold">🌸 Memakai Wewangian</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">Menjaga aroma harum dan tidak mengganggu jamaah.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                  <div className="font-bold">📖 Membaca Al-Kahfi</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">Mendapat cahaya di antara dua Jumat (HR. Al-Hakim).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hadits Larangan Berbicara saat Khutbah (Penting untuk Kelas 5 SD) */}
          <div className="bg-amber-50 dark:bg-slate-800/80 border-2 border-amber-400/50 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm sm:text-base">
                <Info className="w-5 h-5 text-amber-600" />
                <span>Hadis Penting: Larangan Berbicara Saat Khatib Berkhutbah</span>
              </div>
              <button
                onClick={() => speakText("Rasulullah SAW bersabda: Jika engkau berkata kepada temanmu pada hari Jumat 'Diamlah!', sewaktu imam sedang berkhutbah, maka sungguh engkau telah berbuat sia-sia. Hadis riwayat Bukhari dan Muslim.")}
                className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dengar Hadis</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
              "إِذَا قُلْتَ لِصَاحِبِكَ يَوْمَ الْجُمُعَةِ: أَنْصِتْ، وَالإِمَامُ يَخْطُبُ، فَقَدْ لَغَوْتَ"
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <strong>Artinya:</strong> "Jika engkau berkata kepada temanmu pada hari Jumat: 'Diamlah!', sewaktu imam sedang berkhutbah, maka sungguh engkau telah berbuat sia-sia (lagha)." (HR. Bukhari No. 876 & Muslim No. 850).
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CP & TUJUAN PEMBELAJARAN (KURIKULUM MERDEKA) */}
      {activeTab === 'cp_tp' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Standar BSKAP Kemendikbudristek No. 032/H/KR/2024
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Capaian Pembelajaran (CP) Fase C (Kelas 5 SD)
                </h2>
              </div>
              <button
                onClick={() => speakText("Capaian Pembelajaran Elemen Fikih Fase C. Peserta didik mampu memahami dan menerapkan ketentuan salat Jumat, salat duha, dan salat tahajud dengan benar, serta menghargai perbedaan tata cara ibadah sehingga menumbuhkan sikap taat beribadah dan disiplin.")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>Bacakan CP & TP</span>
              </button>
            </div>

            {/* CP Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase">
                Elemen: Fikih Ibadah
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "Peserta didik mampu memahami dan menerapkan ketentuan salat Jumat, salat duha, dan salat tahajud dengan benar, serta menghargai perbedaan tata cara ibadah sehingga menumbuhkan sikap taat beribadah dan disiplin."
              </p>
            </div>

            {/* Tujuan Pembelajaran (TP) Terstruktur */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                <span>5 Tujuan Pembelajaran (TP) & Kriteria Ketercapaian (IKTP):</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    code: "TP 5.1",
                    title: "Konsep Dasar & Hukum",
                    desc: "Menjelaskan pengertian, hukum, dan dalil Al-Qur'an (QS. Al-Jumu'ah: 9-10) serta hadis kewajiban salat Jumat bagi laki-laki muslim baligh.",
                    kktp: "Mampu melafalkan dan menuliskan inti surah Al-Jumu'ah ayat 9 dengan benar."
                  },
                  {
                    code: "TP 5.2",
                    title: "Syarat Wajib vs Syarat Sah",
                    desc: "Mengidentifikasi dan membedakan syarat wajib dan syarat sah salat Jumat dengan cermat.",
                    kktp: "Dapat menyebutkan 5 syarat sah dan 5 syarat wajib tanpa tertukar."
                  },
                  {
                    code: "TP 5.3",
                    title: "Rukun & Ketentuan Dua Khutbah",
                    desc: "Menganalisis 5 rukun dua khutbah Jumat serta syarat khatib menurut mazhab Syafi'i.",
                    kktp: "Menjelaskan urutan hamdalah, shalawat, wasiat takwa, ayat Qur'an, dan doa."
                  },
                  {
                    code: "TP 5.4",
                    title: "Amalan Sunnah & Adab Masjid",
                    desc: "Menerapkan 6 amalan sunnah hari Jumat (mandi, pakaian putih, wewangian, potong kuku, Al-Kahfi, bersegera) dan adab tidak berbicara saat khutbah.",
                    kktp: "Mempraktikkan adab mendengar khutbah dengan khusyuk di masjid."
                  },
                  {
                    code: "TP 5.5",
                    title: "Tata Cara & Hikmah Salat Jumat",
                    desc: "Mengurutkan tata cara pelaksanaan salat Jumat berjamaah dan merefleksikan nilai ukhuwah persatuan umat Islam.",
                    kktp: "Memperagakan salat Jumat secara simulasi di kelas bersama teman."
                  }
                ].map((tp) => (
                  <div key={tp.code} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-750 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                        {tp.code}
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Kelas 5 SD</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tp.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{tp.desc}</p>
                    <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      🎯 Indikator: {tp.kktp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profil Pelajar Pancasila & Rahmatan Lil 'Alamin */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 block">
                Penguatan Profil Pelajar Pancasila (P5) & Rahmatan Lil 'Alamin (P5RA):
              </span>
              <p>
                <strong>1. Beriman & Bertakwa:</strong> Menumbuhkan ketaatan beribadah dan rasa cinta kepada sunnah Rasulullah SAW. <br />
                <strong>2. Mandiri & Disiplin:</strong> Menyiapkan perlengkapan salat Jumat sendiri, tepat waktu, dan menjaga ketenangan. <br />
                <strong>3. Gotong Royong / Ukhuwah:</strong> Mempererat tali persaudaraan sesama muslim di lingkungan masyarakat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: GAME DRAGON BALL (7 BOLA NAGA SHOLAT JUMAT) */}
      {activeTab === 'dragon_ball' && (
        <div className="space-y-6">
          {/* Game Banner Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 text-white p-6 sm:p-8 shadow-2xl border-2 border-amber-300">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/40 text-amber-300 text-xs font-black">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>GAME PETUALANGAN EDUKASI DRAGON BALL</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Misi 7 Bola Naga: Pendekar Sholeh Sholat Jumat
                </h2>
                <p className="text-xs sm:text-sm text-amber-100">
                  Ayo bantu Goku mengumpulkan ke-7 Dragon Ball dengan menjawab 7 tantangan fikih salat Jumat! Kumpulkan seluruh bola untuk memanggil Shenron dan mendapatkan gelar "Pendekar Sholeh Jumat"!
                </p>

                {/* Ki Energy Bar */}
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="flex items-center gap-1 text-slate-950 bg-amber-300 px-2 py-0.5 rounded">
                      <Zap className="w-3.5 h-3.5 text-amber-700" /> Ki Aura Energy:
                    </span>
                    <span className="text-white font-mono">{kiEnergy}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-900/60 rounded-full p-0.5 border border-amber-300/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-500 shadow-sm"
                      style={{ width: `${kiEnergy}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Goku Character Visual Showcase */}
              <div className="shrink-0 flex items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-2xl bg-emerald-950">
                  <img
                    src={GOKU_IMAGE}
                    alt="Goku Super Saiyan Aura Hijau Kristal"
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform ${isKamehamehaActive ? "scale-110 brightness-125" : ""}`}
                  />
                  {isKamehamehaActive && (
                    <div className="absolute inset-0 bg-amber-400/30 animate-ping rounded-2xl pointer-events-none" />
                  )}
                  <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 rounded px-1.5 py-0.5 text-center text-[10px] font-bold text-amber-300">
                    Goku Santri Ki Mode
                  </div>
                </div>
              </div>
            </div>

            {/* 7 Dragon Balls Track Bar */}
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isCollected = collectedDragonBalls.includes(num);
                return (
                  <div
                    key={num}
                    className={`flex flex-col items-center gap-1 shrink-0 p-2 rounded-xl transition-all ${
                      isCollected
                        ? "bg-amber-400 text-slate-950 scale-105 shadow-lg border border-amber-200"
                        : "bg-slate-900/40 text-slate-300 border border-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner ${
                      isCollected
                        ? "bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 ring-2 ring-amber-200"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {num}★
                    </div>
                    <span className="text-[10px] font-bold">
                      {isCollected ? "Terkumpul" : `Bola ${num}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shenron Summoned Victory Celebration */}
          {isShenronSummoned ? (
            <div className="bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 text-center space-y-6 border-4 border-amber-400 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-sm shadow-lg">
                <Award className="w-5 h-5 text-amber-900" />
                <span>NAGA SHENRON TELAH BANGKIT & TERKUMPUL 7 BOLA NAGA!</span>
              </div>

              <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-amber-300 shadow-2xl">
                <img
                  src={SHENRON_IMAGE}
                  alt="Naga Shenron 7 Bola Naga"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-80 object-cover"
                />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
                  Selamat! Anda Meraih Gelar "Pendekar Sholeh Jumat"
                </h3>
                <p className="text-sm text-emerald-100">
                  Ananda telah menjawab seluruh 7 tantangan fikih salat Jumat dengan cermat. Semoga menjadi insan yang istiqomah memakmurkan masjid dan mengamalkan sunnah hari Jumat!
                </p>
                <div className="p-4 bg-emerald-950/60 rounded-2xl border border-amber-400/40 text-xs text-amber-200 leading-relaxed font-serif">
                  "اللَّهُمَّ اجْعَلْنَا مِنَ التَّوَّابِينَ وَاجْعَلْنَا مِنَ الْمُتَطَهِّرِينَ وَاجْعَلْنَا مِنْ عِبَادِكَ الصَّالِحِينَ" <br />
                  <span className="font-sans text-[11px] text-white">
                    (Ya Allah, jadikanlah kami termasuk orang-orang yang bertaubat, orang-orang yang menyucikan diri, dan hamba-hamba-Mu yang sholeh).
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    Swal.fire({
                      icon: "success",
                      title: "Piagam Penghargaan Disimpan!",
                      text: "Skor Game Dragon Ball 100/100 otomatis masuk ke Sheet Pemantauan Aktivitas Guru.",
                      confirmButtonColor: "#059669"
                    });
                  }}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all"
                >
                  Simpan Prestasi ke Sheet Murid
                </button>
                <button
                  onClick={resetDragonBallGame}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 active:scale-95 transition-all"
                >
                  Mainkan Ulang Game
                </button>
              </div>
            </div>
          ) : (
            /* Current Question Card */
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/20 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
                    {DRAGON_BALL_QUESTIONS[currentDbIndex].ballNumber}★
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {DRAGON_BALL_QUESTIONS[currentDbIndex].title}
                  </h3>
                </div>
                <button
                  onClick={() => speakText(`${DRAGON_BALL_QUESTIONS[currentDbIndex].title}. ${DRAGON_BALL_QUESTIONS[currentDbIndex].scenario}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Dengar Soal</span>
                </button>
              </div>

              {/* Scenario */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {DRAGON_BALL_QUESTIONS[currentDbIndex].scenario}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {DRAGON_BALL_QUESTIONS[currentDbIndex].options.map((option) => {
                  const isSelected = selectedDbOption === option.id;
                  const showResult = selectedDbOption !== null;
                  let btnColor = "bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200";

                  if (showResult) {
                    if (option.correct) {
                      btnColor = "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500";
                    } else if (isSelected && !option.correct) {
                      btnColor = "bg-red-100 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 line-through";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerDragonBall(option.id)}
                      disabled={selectedDbOption !== null}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-3 active:scale-[0.99] cursor-pointer ${btnColor}`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        showResult && option.correct
                          ? "bg-emerald-600 text-white"
                          : showResult && isSelected && !option.correct
                          ? "bg-red-600 text-white"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                      }`}>
                        {option.id}
                      </span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next Button */}
              {dbFeedback && (
                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed animate-in fade-in duration-300 ${
                  dbFeedback.isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                    : "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-700"
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {dbFeedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <span>{dbFeedback.isCorrect ? "Benar Sekali!" : "Ulasan Guru PAI:"}</span>
                  </div>
                  <p>{dbFeedback.text}</p>
                </div>
              )}

              {selectedDbOption && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={nextDragonBallQuestion}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Lanjut ke Bola Naga Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: LKPD INTERAKTIF (DURASI MUNDUR 30 DETIK) */}
      {activeTab === 'lkpd_timer' && (
        <div className="space-y-6">
          {/* Header Card with Big 30-Second Countdown Dial */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-400/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>LEMBAR KERJA PESERTA DIDIK (LKPD) KELAS 5</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Tantangan Analisis Kasus (Timer 30 Detik)
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Latih kecepatan berpikir, ketangkasan fikih, dan fokus pemahaman salat Jumat! Setiap kasus studi memiliki batas waktu tepat <strong>30 detik</strong>.
                </p>
              </div>

              {/* 30-Second Dial Indicator */}
              <div className="shrink-0 flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                    lkpdTimer <= 5
                      ? "border-red-500 bg-red-950/40 animate-pulse text-red-400"
                      : lkpdTimer <= 15
                      ? "border-amber-400 bg-amber-950/40 text-amber-300"
                      : "border-emerald-400 bg-emerald-950/40 text-emerald-300"
                  }`}>
                    <div className="text-center">
                      <span className="font-mono text-3xl sm:text-4xl font-black block tracking-tight">
                        {lkpdTimer}s
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {isLkpdTimerRunning ? "Berjalan" : "Berhenti"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="space-y-2">
                  <button
                    onClick={() => setIsLkpdTimerRunning(!isLkpdTimerRunning)}
                    className={`w-full px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isLkpdTimerRunning
                        ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {isLkpdTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isLkpdTimerRunning ? "Jeda Timer" : "Mulai 30s"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setLkpdTimer(30);
                      setIsLkpdTimerRunning(true);
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset 30s</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LKPD Questions Display */}
          {isLkpdFinished ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-emerald-500/30 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                LKPD Salat Jumat Selesai Dikerjakan!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Hebat! Seluruh 5 kasus studi fikih salat Jumat telah Anda selesaikan di bawah batas waktu 30 detik.
              </p>

              {/* Score Recap */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Total Soal Kasus:</span>
                  <span>5 Butir</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Jawaban Tepat:</span>
                  <span>
                    {(Object.values(lkpdAnswers) as Array<{ isCorrect: boolean }>).filter(a => a.isCorrect).length} dari 5
                  </span>
                </div>
                <div className="flex justify-between font-bold text-amber-600">
                  <span>Skor Akhir LKPD:</span>
                  <span className="text-sm font-black">
                    {Math.round(((Object.values(lkpdAnswers) as Array<{ isCorrect: boolean }>).filter(a => a.isCorrect).length / 5) * 100)} / 100
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsLkpdFinished(false);
                    setLkpdIndex(0);
                    setLkpdTimer(30);
                    setLkpdAnswers({});
                    setLkpdSelectedOption(null);
                    setIsLkpdTimerRunning(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  Kerjakan Ulang LKPD
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                    Kasus {lkpdIndex + 1} dari {LKPD_ITEMS.length}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {LKPD_ITEMS[lkpdIndex].title}
                  </h3>
                </div>

                <button
                  onClick={() => speakText(`${LKPD_ITEMS[lkpdIndex].title}. Situasi: ${LKPD_ITEMS[lkpdIndex].situation}. Pertanyaan: ${LKPD_ITEMS[lkpdIndex].question}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-emerald-50 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dengar Narasi Kasus</span>
                </button>
              </div>

              {/* Case Story Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium space-y-2">
                <p><strong>Situasi:</strong> {LKPD_ITEMS[lkpdIndex].situation}</p>
                <p className="font-bold text-emerald-900 dark:text-emerald-300">
                  Pertanyaan: {LKPD_ITEMS[lkpdIndex].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {LKPD_ITEMS[lkpdIndex].options.map((option) => {
                  const answeredRecord = lkpdAnswers[LKPD_ITEMS[lkpdIndex].id];
                  const hasAnswered = Boolean(answeredRecord);
                  const isThisSelected = lkpdSelectedOption === option.id || (hasAnswered && answeredRecord.selected === option.id);
                  let styleClass = "bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200";

                  if (hasAnswered) {
                    if (option.correct) {
                      styleClass = "bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500";
                    } else if (isThisSelected && !option.correct) {
                      styleClass = "bg-red-100 dark:bg-red-950/70 border-red-500 text-red-900 dark:text-red-200 line-through";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => submitLkpdAnswer(option.id)}
                      disabled={hasAnswered || lkpdTimer === 0}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-3 active:scale-[0.99] cursor-pointer ${styleClass}`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        hasAnswered && option.correct
                          ? "bg-emerald-600 text-white"
                          : hasAnswered && isThisSelected && !option.correct
                          ? "bg-red-600 text-white"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                      }`}>
                        {option.id}
                      </span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Hint Callout */}
              <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-300/40">
                💡 <strong>Petunjuk Guru:</strong> {LKPD_ITEMS[lkpdIndex].hint}
              </div>

              {/* Next Navigation */}
              {lkpdAnswers[LKPD_ITEMS[lkpdIndex].id] && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => startNextLkpdQuestion(lkpdIndex + 1)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>{lkpdIndex + 1 === LKPD_ITEMS.length ? "Lihat Hasil LKPD" : "Soal Kasus Berikutnya"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: ASESMEN SUMATIF (10 SOAL STANDAR KKTP) */}
      {activeTab === 'sumatif' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Evaluasi Akhir Modul Fikih (Fase C)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Asesmen Sumatif Salat Jumat (10 Soal)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): Nilai minimal 75 untuk predikat Tuntas.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const answeredCount = Object.keys(sumatifAnswers).length;
                    if (answeredCount < SUMATIF_QUESTIONS.length) {
                      Swal.fire({
                        icon: "warning",
                        title: "Belum Lengkap",
                        text: `Anda baru menjawab ${answeredCount} dari 10 soal. Mohon lengkapi semua soal sebelum mengunci evaluasi.`,
                        confirmButtonColor: "#059669"
                      });
                      return;
                    }
                    setIsSumatifSubmitted(true);
                    playSynthSound('victory');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                >
                  Kunci & Periksa Nilai Sumatif
                </button>
              </div>
            </div>

            {/* Score Banner if Submitted */}
            {isSumatifSubmitted && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase">Hasil Asesmen Sumatif</span>
                    <h3 className="text-2xl font-black">
                      Skor Akhir: {calculateSumatifScore()} / 100
                    </h3>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase ${
                    calculateSumatifScore() >= 75 ? "bg-amber-400 text-slate-950" : "bg-red-500 text-white"
                  }`}>
                    {calculateSumatifScore() >= 75 ? "TUNTAS (KKTP TERCAPAI)" : "PERLU PENGAYAAN / REMEDIAL"}
                  </div>
                </div>
                <p className="text-xs text-emerald-100">
                  {calculateSumatifScore() >= 90
                    ? "Sangat Baik: Ananda menguasai seluruh ketentuan salat Jumat dengan istimewa."
                    : calculateSumatifScore() >= 75
                    ? "Baik: Ananda telah mencapai kriteria ketuntasan tujuan pembelajaran."
                    : "Perlu Bimbingan: Dianjurkan membaca kembali materi rukun khutbah dan syarat sah."}
                </p>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {SUMATIF_QUESTIONS.map((item) => {
                const userChoice = sumatifAnswers[item.no];
                const isCorrect = userChoice === item.ans;

                return (
                  <div key={item.no} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {item.no}
                        </span>
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                          {item.q}
                        </p>
                      </div>
                      <button
                        onClick={() => speakText(`Soal nomor ${item.no}. ${item.q}`)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 shrink-0"
                        title="Dengarkan Soal"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = userChoice === optIdx;
                        let optionStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400";

                        if (isSumatifSubmitted) {
                          if (optIdx === item.ans) {
                            optionStyle = "bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500";
                          } else if (isChosen && optIdx !== item.ans) {
                            optionStyle = "bg-red-100 dark:bg-red-950/70 border-red-500 text-red-900 dark:text-red-200 line-through";
                          }
                        } else if (isChosen) {
                          optionStyle = "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs";
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (isSumatifSubmitted) return;
                              setSumatifAnswers((prev) => ({ ...prev, [item.no]: optIdx }));
                            }}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${optionStyle}`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isChosen ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Discussion on submitted */}
                    {isSumatifSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                          {isCorrect ? "✓ Jawaban Anda Benar" : "✗ Jawaban Tepat: " + String.fromCharCode(65 + item.ans) + ". " + item.options[item.ans]}
                        </div>
                        <p><strong>Pembahasan:</strong> {item.pembahasan}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: POSTER EDUKATIF BERGAMBAR */}
      {activeTab === 'poster' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Media Visual Infografis Ramah Anak
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Poster Edukatif: Panduan Lengkap Salat Jumat
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Infografis tata cara, sunnah, dan adab salat Jumat beresolusi tinggi, siap cetak dan dipajang di kelas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPosterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  <Maximize2 className="w-4 h-4 text-emerald-600" />
                  <span>Perbesar Layar Penuh</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Poster (PDF)</span>
                </button>
              </div>
            </div>

            {/* Poster Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Image Preview */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-emerald-400/50 shadow-2xl bg-slate-900 group">
                <img
                  src={POSTER_IMAGE}
                  alt="Poster Panduan Salat Jumat"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain cursor-pointer group-hover:scale-102 transition-transform duration-300"
                  onClick={() => setIsPosterModalOpen(true)}
                />
                <div className="absolute bottom-3 right-3 bg-slate-950/80 px-3 py-1 rounded-xl text-xs font-bold text-amber-300 backdrop-blur-xs">
                  Klik untuk Zoom Fullscreen
                </div>
              </div>

              {/* Rangkuman Komponen Poster */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Rangkuman Inti Infografis Poster:</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">
                      1. Adab & Persiapan dari Rumah:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Bangun pagi, membaca Surah Al-Kahfi, mandi sunnah Jumat, memakai baju putih bersih, memakai wewangian (bagi laki-laki), serta memotong kuku.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <strong className="text-amber-800 dark:text-amber-300 block mb-1">
                      2. Adab di Dalam Masjid:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Masuk dengan kaki kanan membaca doa, melaksanakan salat Tahiyyatul Masjid 2 rakaat, duduk mendekat ke shaf depan tanpa melangkahi pundak jamaah.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                    <strong className="text-teal-800 dark:text-teal-300 block mb-1">
                      3. Saat Khatib Berkhutbah:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Wajib mendengarkan dengan khusyuk dan dilarang keras berbicara sekalipun untuk menegur orang lain agar diam.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">
                      4. Pelaksanaan Salat Jumat:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Melaksanakan salat 2 rakaat berjamaah bersama imam dengan penuh ketenangan, dilanjutkan dzikir dan doa mustajab Jumat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: SHEET MEMANTAU AKTIVITAS MURID */}
      {activeTab === 'monitoring_sheet' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 space-y-6">
            {/* Header Sheet Monitoring */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Lembar Pantau & Rekap Nilai Siswa
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Sheet Aktivitas Pembelajaran Salat Jumat
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pantau progres belajar, perolehan Bola Naga, ketangkasan LKPD 30s, dan asesmen sumatif murid kelas 5 SD.
                </p>
              </div>

              {/* User-Friendly Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddMuridModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Data Murid</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                  title="Unduh format spreadsheet .xlsx"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handlePrintSheet}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Cetak Rekap (PDF)</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-750 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama murid / NISN..."
                  value={searchMuridQuery}
                  onChange={(e) => setSearchMuridQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="all">Semua Status Ketuntasan</option>
                  <option value="Tuntas">Tuntas (Memenuhi KKTP)</option>
                  <option value="Perlu Bimbingan">Perlu Bimbingan</option>
                </select>
              </div>
            </div>

            {/* Live Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">Total Siswa Terdata</span>
                <span className="text-xl font-black text-emerald-900 dark:text-white tabular-nums">
                  {aktivitasList.length} Murid
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">Tuntas KKTP</span>
                <span className="text-xl font-black text-amber-900 dark:text-white tabular-nums">
                  {aktivitasList.filter(a => a.statusKetuntasan === "Tuntas").length} Anak
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">Rata-rata Dragon Ball</span>
                <span className="text-xl font-black text-teal-900 dark:text-white tabular-nums">
                  {aktivitasList.length > 0
                    ? Math.round(aktivitasList.reduce((acc, curr) => acc + (curr.skorGameDragonBall || 0), 0) / aktivitasList.length)
                    : 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Rata-rata LKPD 30s</span>
                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                  {aktivitasList.length > 0
                    ? Math.round(aktivitasList.reduce((acc, curr) => acc + (curr.skorLkpd30s || 0), 0) / aktivitasList.length)
                    : 0}
                </span>
              </div>
            </div>

            {/* Table of Students Activity */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-800 text-white font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3 text-center">No</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3 text-center">Dragon Ball (★)</th>
                    <th className="p-3 text-center">LKPD (30s)</th>
                    <th className="p-3 text-center">Sumatif</th>
                    <th className="p-3 text-center">Nilai Akhir</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Catatan Guru</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {filteredAktivitas.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-400">
                        Belum ada catatan aktivitas murid. Klik tombol "Tambah Data Murid" di atas untuk mencatat.
                      </td>
                    </tr>
                  ) : (
                    filteredAktivitas.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-emerald-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          <div>{row.namaSiswa}</div>
                          {row.nisn && <div className="text-[10px] text-slate-400">NISN: {row.nisn}</div>}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                          {row.kelas}
                        </td>
                        <td className="p-3 text-center tabular-nums">
                          <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black">
                            {row.skorGameDragonBall}
                          </span>
                        </td>
                        <td className="p-3 text-center tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                          {row.skorLkpd30s}
                        </td>
                        <td className="p-3 text-center tabular-nums font-bold text-slate-700 dark:text-slate-200">
                          {row.skorSumatif}
                        </td>
                        <td className="p-3 text-center tabular-nums">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {row.nilaiAkhir}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            row.statusKetuntasan === "Tuntas"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}>
                            {row.statusKetuntasan}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                          {row.catatanGuru}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteRecord(row.id, row.namaSiswa)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Data Murid ke Sheet */}
      {isAddMuridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Tambah Catatan Aktivitas Murid
              </h3>
              <button
                onClick={() => setIsAddMuridModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMuridActivity} className="space-y-4 text-xs">
              {/* Dropdown pilih dari daftar siswa yang ada */}
              {siswaList.length > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">
                    Pilih Cepat dari Data Siswa Sistem:
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = siswaList.find(s => s.id === e.target.value);
                      if (selected) {
                        setFormNamaMurid(selected.nama);
                        setFormKelasMurid(selected.kelas || "V A");
                        setFormNisnMurid(selected.nisn || "");
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- Pilih Siswa Kelas --</option>
                    {siswaList.map(s => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Nama Lengkap Siswa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Wildan Fikri"
                  value={formNamaMurid}
                  onChange={(e) => setFormNamaMurid(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">Kelas:</label>
                  <input
                    type="text"
                    value={formKelasMurid}
                    onChange={(e) => setFormKelasMurid(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">NISN (Opsional):</label>
                  <input
                    type="text"
                    placeholder="0012345678"
                    value={formNisnMurid}
                    onChange={(e) => setFormNisnMurid(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">Dragon Ball:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSkorDragonBall}
                    onChange={(e) => setFormSkorDragonBall(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">LKPD 30s:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSkorLkpd}
                    onChange={(e) => setFormSkorLkpd(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">Sumatif:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSkorSumatif}
                    onChange={(e) => setFormSkorSumatif(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200">Catatan Evaluasi Guru:</label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMuridModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fullscreen Poster Preview */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar bg-slate-900 rounded-3xl p-4 border border-emerald-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <h3 className="font-bold text-sm text-amber-300">
                Mode Layar Penuh Poster Infografis Salat Jumat
              </h3>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                Tutup (ESC)
              </button>
            </div>

            <div className="py-4 flex justify-center">
              <img
                src={POSTER_IMAGE}
                alt="Poster Salat Jumat Resolusi Penuh"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto rounded-2xl shadow-2xl object-contain border border-emerald-400/30"
              />
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Poster Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
