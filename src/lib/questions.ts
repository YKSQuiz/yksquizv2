
import type { Question, ExamType, Subject, Topic } from './types';
import {
  ClipboardList, Calculator, BookOpenText, Scale, Languages, ScrollText, Globe, Brain, BookHeart, Sigma, Atom, FlaskConical, Leaf, ScanText, Baseline, AlignLeft, SpellCheck, MessageSquare, Milestone, Info, SquareFunction, TextCursorInput, Rows3, ListTree, DraftingCompass, TextQuote, Laugh
} from 'lucide-react';

export const EXAM_TYPES: ExamType[] = [
  { id: 'tyt', name: 'TYT', icon: ClipboardList, description: 'Temel Yeterlilik Testi', imageUrl: 'https://i.ibb.co/HCpVyM4/Whats-App-Image-2024-07-01-at-18-37-04.jpg', dataAiHint: 'TYT collage' },
  { id: 'ayt-sozel', name: 'AYT-Sözel', icon: BookOpenText, description: 'Alan Yeterlilik Testi - Sözel', imageUrl: 'https://placehold.co/160x160.png', dataAiHint: 'books study' },
  { id: 'ayt-sayisal', name: 'AYT-Sayısal', icon: Calculator, description: 'Alan Yeterlilik Testi - Sayısal', imageUrl: 'https://placehold.co/160x160.png', dataAiHint: 'math science' },
  { id: 'ayt-esitagirlik', name: 'AYT-EşitAğırlık', icon: Scale, description: 'Alan Yeterlilik Testi - Eşit Ağırlık', imageUrl: 'https://placehold.co/160x160.png', dataAiHint: 'law balance' },
];


export const SUBJECTS: Subject[] = [
  // TYT Subjects
  { id: 'turkish', name: 'Türkçe', examType: 'tyt', icon: Languages, description: 'Paragraf, anlam ve dil bilgisi sorularında hız ve doğruluğunu test et.' },
  { id: 'history', name: 'Tarih', examType: 'tyt', icon: ScrollText, description: 'Tarihsel süreçleri ve yorumları anlama becerini geliştirecek sorular.' },
  { id: 'geography', name: 'Coğrafya', examType: 'tyt', icon: Globe, description: 'Türkiye ve dünya üzerindeki coğrafi kavramlara hâkim misin?' },
  { id: 'philosophy', name: 'Felsefe', examType: 'tyt', icon: Brain, description: 'Düşünce dünyasında kısa bir yolculuk: kavramları tanı ve çözümle.' },
  { id: 'religion', name: 'Din Kültürü ve Ahlak Bilgisi', examType: 'tyt', icon: BookHeart, description: 'Etik, inanç sistemleri ve temel dini bilgiler üzerine sorular.' },
  { id: 'math', name: 'Matematik', examType: 'tyt', icon: Sigma, description: 'Sayılar, oran-orantı, geometri: Temel bilgileri ölç.' },
  { id: 'physics', name: 'Fizik', examType: 'tyt', icon: Atom, description: 'Kuvvet, hareket, enerji gibi temel prensiplere dair testler.' },
  { id: 'chemistry', name: 'Kimya', examType: 'tyt', icon: FlaskConical, description: 'Atomlar, bileşikler, temel kimyasal hesaplamalar hakkında sorular.' },
  { id: 'biology', name: 'Biyoloji', examType: 'tyt', icon: Leaf, description: 'Hücre, canlılar dünyası ve biyolojik sistemleri keşfet.' },
  // TODO: Add subjects for AYT variants if needed
];

export const TOPICS: Topic[] = [
  // TYT - Turkish Topics
  { id: 'word-meaning', name: 'Sözcükte Anlam', subject: 'turkish', examType: 'tyt', icon: ScanText, description: 'Kelimelerin farklı anlamları ve kullanımları.' },
  { id: 'sentence-meaning', name: 'Cümlede Anlam', subject: 'turkish', examType: 'tyt', icon: Baseline, description: 'Cümlelerin ifade ettiği anlamlar ve ilişkiler.' },
  { id: 'paragraph-information', name: 'Paragrafta Anlam', subject: 'turkish', examType: 'tyt', icon: AlignLeft, description: 'Paragrafın ana fikri, yardımcı düşünceleri ve yapısı.' },
  { id: 'sound-information', name: 'Ses Bilgisi', subject: 'turkish', examType: 'tyt', icon: Info, description: 'Türkçedeki sesler, ses olayları.' },
  { id: 'word-structure', name: 'Sözcük Yapısı', subject: 'turkish', examType: 'tyt', icon: Milestone, description: 'Kök, gövde, ekler ve sözcük türetme.' },
  { id: 'word-types', name: 'Sözcük Türleri', subject: 'turkish', examType: 'tyt', icon: TextCursorInput, description: 'İsim, sıfat, zamir, zarf, fiil vb.' },
  { id: 'sentence-elements', name: 'Cümlenin Öğeleri', subject: 'turkish', examType: 'tyt', icon: Rows3, description: 'Özne, yüklem, nesne, tümleçler.' },
  { id: 'sentence-types', name: 'Cümle Türleri', subject: 'turkish', examType: 'tyt', icon: MessageSquare, description: 'Yapısına ve anlamına göre cümle çeşitleri.' },
  { id: 'spelling-rules', name: 'Yazım Kuralları', subject: 'turkish', examType: 'tyt', icon: SpellCheck, description: 'Doğru yazım ve imla kuralları.' },
  { id: 'punctuation-marks', name: 'Noktalama İşaretleri', subject: 'turkish', examType: 'tyt', icon: SquareFunction, description: 'Noktalama işaretlerinin doğru kullanımı.' },
  { id: 'expression-disorders', name: 'Anlatım Bozuklukları', subject: 'turkish', examType: 'tyt', icon: TextQuote, description: 'Cümlelerdeki anlatım yanlışları.' },
  { id: 'verbal-logic', name: 'Sözel Mantık ve Muhakeme', subject: 'turkish', examType: 'tyt', icon: Laugh, description: 'Mantıksal çıkarımlar ve problem çözme.' },
  // TYT - Math Topics (Sample)
  { id: 'basic-concepts', name: 'Temel Kavramlar', subject: 'math', examType: 'tyt', icon: DraftingCompass, description: 'Sayılar, basamak kavramı, bölme-bölünebilme.' },
  { id: 'equations', name: 'Denklemler', subject: 'math', examType: 'tyt', icon: Sigma, description: 'Birinci dereceden denklemler, eşitsizlikler.' },
];

export const ALL_QUESTIONS: Question[] = [
  // TYT - Turkish - Word Meaning
  {
    id: 'q1_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: 'Aşağıdaki cümlelerin hangisinde "açık" sözcüğü "Belli, anlaşılır, kolay anlaşılabilen" anlamında kullanılmıştır?',
    options: [ { id: 'a', text: 'Bugün hava çok açık.' }, { id: 'b', text: 'Bu konudaki düşünceleri oldukça açıktı.' }, { id: 'c', text: 'Mağazanın kapısı her zaman açıktır.' }, { id: 'd', text: 'Açık renkli elbiseleri severdi.' }, ],
    correctAnswerId: 'b',
  },
  {
    id: 'q2_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Kırmak" sözcüğü aşağıdaki cümlelerin hangisinde "bir şeyin fiyatını azaltmak, indirmek" anlamında kullanılmıştır?',
    options: [ { id: 'a', text: 'Camı kırdığı için çok üzgündü.' }, { id: 'b', text: 'Pazarlıkta fiyatı biraz daha kırdı.' }, { id: 'c', text: 'Arkadaşının kalbini kırmak istemiyordu.' }, { id: 'd', text: 'Odunları küçük parçalara kırdı.' }, ],
    correctAnswerId: 'b',
  },
  {
    id: 'q3_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Geçmek" sözcüğü hangi cümlede "etkisini yitirmek, son bulmak" anlamında kullanılmıştır?',
    options: [ { id: 'a', text: 'Bu yol köyden geçer.' }, { id: 'b', text: 'Sınavı başarıyla geçti.' }, { id: 'c', text: 'Baş ağrısı nihayet geçti.' }, { id: 'd', text: 'Vakit çok çabuk geçiyor.' }, ],
    correctAnswerId: 'c',
  },
  {
    id: 'q4_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: 'Aşağıdaki cümlelerin hangisinde "keskin" sözcüğü mecaz anlamda kullanılmıştır?',
    options: [
      { id: 'a', text: 'Bıçak çok keskindi, ekmeği kolayca kesti.' },
      { id: 'b', text: 'Keskin bir zekâsı vardı, sorunları hemen çözerdi.' },
      { id: 'c', text: 'Rüzgâr keskin esiyordu, yüzümüzü üşüttü.' },
      { id: 'd', text: 'Makasın ucu oldukça keskindi.' },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'q5_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Ak" sözcüğünün eş anlamlısı aşağıdaki cümlelerin hangisinde kullanılmıştır?',
    options: [
      { id: 'a', text: 'Kara bulutlar gökyüzünü kapladı.' },
      { id: 'b', text: 'Saçlarına düşen beyaz teller yaşını eleveriyordu.' },
      { id: 'c', text: 'Kırmızı elbisesiyle dikkat çekiyordu.' },
      { id: 'd', text: 'Mavi gökyüzü içimizi açtı.' },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'q6_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Yaşlı" sözcüğünün zıt anlamlısı hangi seçenekte doğru verilmiştir?',
    options: [
      { id: 'a', text: 'İhtiyar' },
      { id: 'b', text: 'Genç' },
      { id: 'c', text: 'Eski' },
      { id: 'd', text: 'Büyük' },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'q7_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Yüz" sözcüğü aşağıdaki cümlelerin hangisinde sayı anlamında kullanılmıştır?',
    options: [
      { id: 'a', text: 'Denizde yüzmeyi çok severdi.' },
      { id: 'b', text: 'Kitabın yüz sayfasını okumuştu.' },
      { id: 'c', text: 'Olaydan sonra yüzü asıldı.' },
      { id: 'd', text: 'Koyunun derisini yüzdüler.' },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'q8_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Göze girmek" deyiminin anlamı aşağıdakilerden hangisidir?',
    options: [
      { id: 'a', text: 'Bir şeyi çok beğenmek.' },
      { id: 'b', text: 'Birinin takdirini, beğenisini kazanmak.' },
      { id: 'c', text: 'Gözle ilgili bir rahatsızlık yaşamak.' },
      { id: 'd', text: 'Çok dikkatli olmak.' },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'q9_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Perde" sözcüğü aşağıdaki cümlelerin hangisinde tiyatro terimi olarak kullanılmıştır?',
    options: [
      { id: 'a', text: 'Pencerenin perdesini kapattı.' },
      { id: 'b', text: 'Gözlerindeki sis perdesi kalktı.' },
      { id: 'c', text: 'Oyunun ikinci perdesi çok beğenildi.' },
      { id: 'd', text: 'Bu olay iki ülke arasında bir perde oluşturdu.' },
    ],
    correctAnswerId: 'c',
  },
  {
    id: 'q10_tyt_turkish_word-meaning', examType: 'tyt', subject: 'turkish', topic: 'word-meaning',
    text: '"Yol" sözcüğü aşağıdaki cümlelerin hangisinde "davranış, tutum, yöntem" anlamında kullanılmıştır?',
    options: [
      { id: 'a', text: 'Bu yol doğrudan köye gider.' },
      { id: 'b', text: 'Sorunu çözmek için farklı bir yol denedi.' },
      { id: 'c', text: 'Uzun bir yolculuktan sonra yorulmuştu.' },
      { id: 'd', text: 'Patika yol ormanın içinden geçiyordu.' },
    ],
    correctAnswerId: 'b',
  },
  // TYT - Turkish - Sentence Meaning
  {
    id: 'q1_tyt_turkish_sentence-meaning', examType: 'tyt', subject: 'turkish', topic: 'sentence-meaning',
    text: 'Aşağıdaki cümlelerin hangisinde "amaç-sonuç" ilişkisi vardır?',
    options: [ { id: 'a', text: 'Çok çalıştığı için sınavı kazandı.' }, { id: 'b', text: 'Yağmur yağdığından piknik iptal oldu.' }, { id: 'c', text: 'İyi bir gelecek için yurt dışına gitti.' }, { id: 'd', text: 'Hava soğuk olduğu için kalın giyindi.' }, ],
    correctAnswerId: 'c',
  },
  {
    id: 'q2_tyt_turkish_sentence-meaning', examType: 'tyt', subject: 'turkish', topic: 'sentence-meaning',
    text: 'Hangisinde "koşul" anlamı vardır?',
    options: [ { id: 'a', text: 'Erken kalkarsan kahvaltıyı hazırlarsın.' }, { id: 'b', text: 'Kitap okumayı çok severdi.' }, { id: 'c', text: 'Film o kadar etkileyiciydi ki ağladı.' }, { id: 'd', text: 'Spora gitti çünkü sağlıklı olmak istiyordu.' }, ],
    correctAnswerId: 'a',
  },
  // TYT - Math - Basic Concepts
  {
    id: 'q1_tyt_math_basic-concepts', examType: 'tyt', subject: 'math', topic: 'basic-concepts',
    text: 'İki basamaklı en büyük çift sayı ile iki basamaklı en küçük tek sayının toplamı kaçtır?',
    options: [ { id: 'a', text: '107' }, { id: 'b', text: '108' }, { id: 'c', text: '109' }, { id: 'd', text: '110' }, ],
    correctAnswerId: 'c', // 98 + 11 = 109
  },
  {
    id: 'q2_tyt_math_basic-concepts', examType: 'tyt', subject: 'math', topic: 'basic-concepts',
    text: 'Hangi sayı 3 ile tam bölünemez?',
    options: [ { id: 'a', text: '123' }, { id: 'b', text: '456' }, { id: 'c', text: '788' }, { id: 'd', text: '903' }, ],
    correctAnswerId: 'c', // 7+8+8 = 23
  },
];

