export interface Team {
  id: string;
  group: string;
  name: string;
  flag: string;
  rating: number;
}

export type Slot =
  | { t: 'w'; g: string }
  | { t: 'ru'; g: string }
  | { t: '3w'; wg: string }
  | { t: 'mw'; m: number }
  | { t: 'ml'; m: number };

export interface Match {
  id: number;
  a: Slot;
  b: Slot;
}

export interface Round {
  key: string;
  title: string;
  date: string;
  ms: Match[];
}

export interface State {
  order: Record<string, string[]>;
  thirds: Set<string>;
  picks: Record<number, string>;
}

export const ANNEX: Record<string, string> = {"EFGHIJKL":"EJIFHGLK","DFGHIJKL":"HGIDJFLK","DEGHIJKL":"EJIDHGLK","DEFHIJKL":"EJIDHFLK","DEFGIJKL":"EGIDJFLK","DEFGHJKL":"EGJDHFLK","DEFGHIKL":"EGIDHFLK","DEFGHIJL":"EGJDHFLI","DEFGHIJK":"EGJDHFIK","CFGHIJKL":"HGICJFLK","CEGHIJKL":"EJICHGLK","CEFHIJKL":"EJICHFLK","CEFGIJKL":"EGICJFLK","CEFGHJKL":"EGJCHFLK","CEFGHIKL":"EGICHFLK","CEFGHIJL":"EGJCHFLI","CEFGHIJK":"EGJCHFIK","CDGHIJKL":"HGICJDLK","CDFHIJKL":"CJIDHFLK","CDFGIJKL":"CGIDJFLK","CDFGHJKL":"CGJDHFLK","CDFGHIKL":"CGIDHFLK","CDFGHIJL":"CGJDHFLI","CDFGHIJK":"CGJDHFIK","CDEHIJKL":"EJICHDLK","CDEGIJKL":"EGICJDLK","CDEGHJKL":"EGJCHDLK","CDEGHIKL":"EGICHDLK","CDEGHIJL":"EGJCHDLI","CDEGHIJK":"EGJCHDIK","CDEFIJKL":"CJEDIFLK","CDEFHJKL":"CJEDHFLK","CDEFHIKL":"CEIDHFLK","CDEFHIJL":"CJEDHFLI","CDEFHIJK":"CJEDHFIK","CDEFGJKL":"CGEDJFLK","CDEFGIKL":"CGEDIFLK","CDEFGIJL":"CGEDJFLI","CDEFGIJK":"CGEDJFIK","CDEFGHKL":"CGEDHFLK","CDEFGHJL":"CGJDHFLE","CDEFGHJK":"CGJDHFEK","CDEFGHIL":"CGEDHFLI","CDEFGHIK":"CGEDHFIK","CDEFGHIJ":"CGJDHFEI","BFGHIJKL":"HJBFIGLK","BEGHIJKL":"EJIBHGLK","BEFHIJKL":"EJBFIHLK","BEFGIJKL":"EJBFIGLK","BEFGHJKL":"EJBFHGLK","BEFGHIKL":"EGBFIHLK","BEFGHIJL":"EJBFHGLI","BEFGHIJK":"EJBFHGIK","BDGHIJKL":"HJBDIGLK","BDFHIJKL":"HJBDIFLK","BDFGIJKL":"IGBDJFLK","BDFGHJKL":"HGBDJFLK","BDFGHIKL":"HGBDIFLK","BDFGHIJL":"HGBDJFLI","BDFGHIJK":"HGBDJFIK","BDEHIJKL":"EJBDIHLK","BDEGIJKL":"EJBDIGLK","BDEGHJKL":"EJBDHGLK","BDEGHIKL":"EGBDIHLK","BDEGHIJL":"EJBDHGLI","BDEGHIJK":"EJBDHGIK","BDEFIJKL":"EJBDIFLK","BDEFHJKL":"EJBDHFLK","BDEFHIKL":"EIBDHFLK","BDEFHIJL":"EJBDHFLI","BDEFHIJK":"EJBDHFIK","BDEFGJKL":"EGBDJFLK","BDEFGIKL":"EGBDIFLK","BDEFGIJL":"EGBDJFLI","BDEFGIJK":"EGBDJFIK","BDEFGHKL":"EGBDHFLK","BDEFGHJL":"HGBDJFLE","BDEFGHJK":"HGBDJFEK","BDEFGHIL":"EGBDHFLI","BDEFGHIK":"EGBDHFIK","BDEFGHIJ":"HGBDJFEI","BCGHIJKL":"HJBCIGLK","BCFHIJKL":"HJBCIFLK","BCFGIJKL":"IGBCJFLK","BCFGHJKL":"HGBCJFLK","BCFGHIKL":"HGBCIFLK","BCFGHIJL":"HGBCJFLI","BCFGHIJK":"HGBCJFIK","BCEHIJKL":"EJBCIHLK","BCEGIJKL":"EJBCIGLK","BCEGHJKL":"EJBCHGLK","BCEGHIKL":"EGBCIHLK","BCEGHIJL":"EJBCHGLI","BCEGHIJK":"EJBCHGIK","BCEFIJKL":"EJBCIFLK","BCEFHJKL":"EJBCHFLK","BCEFHIKL":"EIBCHFLK","BCEFHIJL":"EJBCHFLI","BCEFHIJK":"EJBCHFIK","BCEFGJKL":"EGBCJFLK","BCEFGIKL":"EGBCIFLK","BCEFGIJL":"EGBCJFLI","BCEFGIJK":"EGBCJFIK","BCEFGHKL":"EGBCHFLK","BCEFGHJL":"HGBCJFLE","BCEFGHJK":"HGBCJFEK","BCEFGHIL":"EGBCHFLI","BCEFGHIK":"EGBCHFIK","BCEFGHIJ":"HGBCJFEI","BCDHIJKL":"HJBCIDLK","BCDGIJKL":"IGBCJDLK","BCDGHJKL":"HGBCJDLK","BCDGHIKL":"HGBCIDLK","BCDGHIJL":"HGBCJDLI","BCDGHIJK":"HGBCJDIK","BCDFIJKL":"CJBDIFLK","BCDFHJKL":"CJBDHFLK","BCDFHIKL":"CIBDHFLK","BCDFHIJL":"CJBDHFLI","BCDFHIJK":"CJBDHFIK","BCDFGJKL":"CGBDJFLK","BCDFGIKL":"CGBDIFLK","BCDFGIJL":"CGBDJFLI","BCDFGIJK":"CGBDJFIK","BCDFGHKL":"CGBDHFLK","BCDFGHJL":"CGBDHFLJ","BCDFGHJK":"HGBCJFDK","BCDFGHIL":"CGBDHFLI","BCDFGHIK":"CGBDHFIK","BCDFGHIJ":"HGBCJFDI","BCDEIJKL":"EJBCIDLK","BCDEHJKL":"EJBCHDLK","BCDEHIKL":"EIBCHDLK","BCDEHIJL":"EJBCHDLI","BCDEHIJK":"EJBCHDIK","BCDEGJKL":"EGBCJDLK","BCDEGIKL":"EGBCIDLK","BCDEGIJL":"EGBCJDLI","BCDEGIJK":"EGBCJDIK","BCDEGHKL":"EGBCHDLK","BCDEGHJL":"HGBCJDLE","BCDEGHJK":"HGBCJDEK","BCDEGHIL":"EGBCHDLI","BCDEGHIK":"EGBCHDIK","BCDEGHIJ":"HGBCJDEI","BCDEFJKL":"CJBDEFLK","BCDEFIKL":"CEBDIFLK","BCDEFIJL":"CJBDEFLI","BCDEFIJK":"CJBDEFIK","BCDEFHKL":"CEBDHFLK","BCDEFHJL":"CJBDHFLE","BCDEFHJK":"CJBDHFEK","BCDEFHIL":"CEBDHFLI","BCDEFHIK":"CEBDHFIK","BCDEFHIJ":"CJBDHFEI","BCDEFGKL":"CGBDEFLK","BCDEFGJL":"CGBDJFLE","BCDEFGJK":"CGBDJFEK","BCDEFGIL":"CGBDEFLI","BCDEFGIK":"CGBDEFIK","BCDEFGIJ":"CGBDJFEI","BCDEFGHL":"CGBDHFLE","BCDEFGHK":"CGBDHFEK","BCDEFGHJ":"HGBCJFDE","BCDEFGHI":"CGBDHFEI","AFGHIJKL":"HJIFAGLK","AEGHIJKL":"EJIAHGLK","AEFHIJKL":"EJIFAHLK","AEFGIJKL":"EJIFAGLK","AEFGHJKL":"EGJFAHLK","AEFGHIKL":"EGIFAHLK","AEFGHIJL":"EGJFAHLI","AEFGHIJK":"EGJFAHIK","ADGHIJKL":"HJIDAGLK","ADFHIJKL":"HJIDAFLK","ADFGIJKL":"IGJDAFLK","ADFGHJKL":"HGJDAFLK","ADFGHIKL":"HGIDAFLK","ADFGHIJL":"HGJDAFLI","ADFGHIJK":"HGJDAFIK","ADEHIJKL":"EJIDAHLK","ADEGIJKL":"EJIDAGLK","ADEGHJKL":"EGJDAHLK","ADEGHIKL":"EGIDAHLK","ADEGHIJL":"EGJDAHLI","ADEGHIJK":"EGJDAHIK","ADEFIJKL":"EJIDAFLK","ADEFHJKL":"HJEDAFLK","ADEFHIKL":"HEIDAFLK","ADEFHIJL":"HJEDAFLI","ADEFHIJK":"HJEDAFIK","ADEFGJKL":"EGJDAFLK","ADEFGIKL":"EGIDAFLK","ADEFGIJL":"EGJDAFLI","ADEFGIJK":"EGJDAFIK","ADEFGHKL":"HGEDAFLK","ADEFGHJL":"HGJDAFLE","ADEFGHJK":"HGJDAFEK","ADEFGHIL":"HGEDAFLI","ADEFGHIK":"HGEDAFIK","ADEFGHIJ":"HGJDAFEI","ACGHIJKL":"HJICAGLK","ACFHIJKL":"HJICAFLK","ACFGIJKL":"IGJCAFLK","ACFGHJKL":"HGJCAFLK","ACFGHIKL":"HGICAFLK","ACFGHIJL":"HGJCAFLI","ACFGHIJK":"HGJCAFIK","ACEHIJKL":"EJICAHLK","ACEGIJKL":"EJICAGLK","ACEGHJKL":"EGJCAHLK","ACEGHIKL":"EGICAHLK","ACEGHIJL":"EGJCAHLI","ACEGHIJK":"EGJCAHIK","ACEFIJKL":"EJICAFLK","ACEFHJKL":"HJECAFLK","ACEFHIKL":"HEICAFLK","ACEFHIJL":"HJECAFLI","ACEFHIJK":"HJECAFIK","ACEFGJKL":"EGJCAFLK","ACEFGIKL":"EGICAFLK","ACEFGIJL":"EGJCAFLI","ACEFGIJK":"EGJCAFIK","ACEFGHKL":"HGECAFLK","ACEFGHJL":"HGJCAFLE","ACEFGHJK":"HGJCAFEK","ACEFGHIL":"HGECAFLI","ACEFGHIK":"HGECAFIK","ACEFGHIJ":"HGJCAFEI","ACDHIJKL":"HJICADLK","ACDGIJKL":"IGJCADLK","ACDGHJKL":"HGJCADLK","ACDGHIKL":"HGICADLK","ACDGHIJL":"HGJCADLI","ACDGHIJK":"HGJCADIK","ACDFIJKL":"CJIDAFLK","ACDFHJKL":"HJFCADLK","ACDFHIKL":"HFICADLK","ACDFHIJL":"HJFCADLI","ACDFHIJK":"HJFCADIK","ACDFGJKL":"CGJDAFLK","ACDFGIKL":"CGIDAFLK","ACDFGIJL":"CGJDAFLI","ACDFGIJK":"CGJDAFIK","ACDFGHKL":"HGFCADLK","ACDFGHJL":"CGJDAFLH","ACDFGHJK":"HGJCAFDK","ACDFGHIL":"HGFCADLI","ACDFGHIK":"HGFCADIK","ACDFGHIJ":"HGJCAFDI","ACDEIJKL":"EJICADLK","ACDEHJKL":"HJECADLK","ACDEHIKL":"HEICADLK","ACDEHIJL":"HJECADLI","ACDEHIJK":"HJECADIK","ACDEGJKL":"EGJCADLK","ACDEGIKL":"EGICADLK","ACDEGIJL":"EGJCADLI","ACDEGIJK":"EGJCADIK","ACDEGHKL":"HGECADLK","ACDEGHJL":"HGJCADLE","ACDEGHJK":"HGJCADEK","ACDEGHIL":"HGECADLI","ACDEGHIK":"HGECADIK","ACDEGHIJ":"HGJCADEI","ACDEFJKL":"CJEDAFLK","ACDEFIKL":"CEIDAFLK","ACDEFIJL":"CJEDAFLI","ACDEFIJK":"CJEDAFIK","ACDEFHKL":"HEFCADLK","ACDEFHJL":"HJFCADLE","ACDEFHJK":"HJECAFDK","ACDEFHIL":"HEFCADLI","ACDEFHIK":"HEFCADIK","ACDEFHIJ":"HJECAFDI","ACDEFGKL":"CGEDAFLK","ACDEFGJL":"CGJDAFLE","ACDEFGJK":"CGJDAFEK","ACDEFGIL":"CGEDAFLI","ACDEFGIK":"CGEDAFIK","ACDEFGIJ":"CGJDAFEI","ACDEFGHL":"HGFCADLE","ACDEFGHK":"HGECAFDK","ACDEFGHJ":"HGJCAFDE","ACDEFGHI":"HGECAFDI","ABGHIJKL":"HJBAIGLK","ABFHIJKL":"HJBAIFLK","ABFGIJKL":"IJBFAGLK","ABFGHJKL":"HJBFAGLK","ABFGHIKL":"HGBAIFLK","ABFGHIJL":"HJBFAGLI","ABFGHIJK":"HJBFAGIK","ABEHIJKL":"EJBAIHLK","ABEGIJKL":"EJBAIGLK","ABEGHJKL":"EJBAHGLK","ABEGHIKL":"EGBAIHLK","ABEGHIJL":"EJBAHGLI","ABEGHIJK":"EJBAHGIK","ABEFIJKL":"EJBAIFLK","ABEFHJKL":"EJBFAHLK","ABEFHIKL":"EIBFAHLK","ABEFHIJL":"EJBFAHLI","ABEFHIJK":"EJBFAHIK","ABEFGJKL":"EJBFAGLK","ABEFGIKL":"EGBAIFLK","ABEFGIJL":"EJBFAGLI","ABEFGIJK":"EJBFAGIK","ABEFGHKL":"EGBFAHLK","ABEFGHJL":"HJBFAGLE","ABEFGHJK":"HJBFAGEK","ABEFGHIL":"EGBFAHLI","ABEFGHIK":"EGBFAHIK","ABEFGHIJ":"HJBFAGEI","ABDHIJKL":"IJBDAHLK","ABDGIJKL":"IJBDAGLK","ABDGHJKL":"HJBDAGLK","ABDGHIKL":"IGBDAHLK","ABDGHIJL":"HJBDAGLI","ABDGHIJK":"HJBDAGIK","ABDFIJKL":"IJBDAFLK","ABDFHJKL":"HJBDAFLK","ABDFHIKL":"HIBDAFLK","ABDFHIJL":"HJBDAFLI","ABDFHIJK":"HJBDAFIK","ABDFGJKL":"FJBDAGLK","ABDFGIKL":"IGBDAFLK","ABDFGIJL":"FJBDAGLI","ABDFGIJK":"FJBDAGIK","ABDFGHKL":"HGBDAFLK","ABDFGHJL":"HGBDAFLJ","ABDFGHJK":"HGBDAFJK","ABDFGHIL":"HGBDAFLI","ABDFGHIK":"HGBDAFIK","ABDFGHIJ":"HGBDAFIJ","ABDEIJKL":"EJBAIDLK","ABDEHJKL":"EJBDAHLK","ABDEHIKL":"EIBDAHLK","ABDEHIJL":"EJBDAHLI","ABDEHIJK":"EJBDAHIK","ABDEGJKL":"EJBDAGLK","ABDEGIKL":"EGBAIDLK","ABDEGIJL":"EJBDAGLI","ABDEGIJK":"EJBDAGIK","ABDEGHKL":"EGBDAHLK","ABDEGHJL":"HJBDAGLE","ABDEGHJK":"HJBDAGEK","ABDEGHIL":"EGBDAHLI","ABDEGHIK":"EGBDAHIK","ABDEGHIJ":"HJBDAGEI","ABDEFJKL":"EJBDAFLK","ABDEFIKL":"EIBDAFLK","ABDEFIJL":"EJBDAFLI","ABDEFIJK":"EJBDAFIK","ABDEFHKL":"HEBDAFLK","ABDEFHJL":"HJBDAFLE","ABDEFHJK":"HJBDAFEK","ABDEFHIL":"HEBDAFLI","ABDEFHIK":"HEBDAFIK","ABDEFHIJ":"HJBDAFEI","ABDEFGKL":"EGBDAFLK","ABDEFGJL":"EGBDAFLJ","ABDEFGJK":"EGBDAFJK","ABDEFGIL":"EGBDAFLI","ABDEFGIK":"EGBDAFIK","ABDEFGIJ":"EGBDAFIJ","ABDEFGHL":"HGBDAFLE","ABDEFGHK":"HGBDAFEK","ABDEFGHJ":"HGBDAFEJ","ABDEFGHI":"HGBDAFEI","ABCHIJKL":"IJBCAHLK","ABCGIJKL":"IJBCAGLK","ABCGHJKL":"HJBCAGLK","ABCGHIKL":"IGBCAHLK","ABCGHIJL":"HJBCAGLI","ABCGHIJK":"HJBCAGIK","ABCFIJKL":"IJBCAFLK","ABCFHJKL":"HJBCAFLK","ABCFHIKL":"HIBCAFLK","ABCFHIJL":"HJBCAFLI","ABCFHIJK":"HJBCAFIK","ABCFGJKL":"CJBFAGLK","ABCFGIKL":"IGBCAFLK","ABCFGIJL":"CJBFAGLI","ABCFGIJK":"CJBFAGIK","ABCFGHKL":"HGBCAFLK","ABCFGHJL":"HGBCAFLJ","ABCFGHJK":"HGBCAFJK","ABCFGHIL":"HGBCAFLI","ABCFGHIK":"HGBCAFIK","ABCFGHIJ":"HGBCAFIJ","ABCEIJKL":"EJBAICLK","ABCEHJKL":"EJBCAHLK","ABCEHIKL":"EIBCAHLK","ABCEHIJL":"EJBCAHLI","ABCEHIJK":"EJBCAHIK","ABCEGJKL":"EJBCAGLK","ABCEGIKL":"EGBAICLK","ABCEGIJL":"EJBCAGLI","ABCEGIJK":"EJBCAGIK","ABCEGHKL":"EGBCAHLK","ABCEGHJL":"HJBCAGLE","ABCEGHJK":"HJBCAGEK","ABCEGHIL":"EGBCAHLI","ABCEGHIK":"EGBCAHIK","ABCEGHIJ":"HJBCAGEI","ABCEFJKL":"EJBCAFLK","ABCEFIKL":"EIBCAFLK","ABCEFIJL":"EJBCAFLI","ABCEFIJK":"EJBCAFIK","ABCEFHKL":"HEBCAFLK","ABCEFHJL":"HJBCAFLE","ABCEFHJK":"HJBCAFEK","ABCEFHIL":"HEBCAFLI","ABCEFHIK":"HEBCAFIK","ABCEFHIJ":"HJBCAFEI","ABCEFGKL":"EGBCAFLK","ABCEFGJL":"EGBCAFLJ","ABCEFGJK":"EGBCAFJK","ABCEFGIL":"EGBCAFLI","ABCEFGIK":"EGBCAFIK","ABCEFGIJ":"EGBCAFIJ","ABCEFGHL":"HGBCAFLE","ABCEFGHK":"HGBCAFEK","ABCEFGHJ":"HGBCAFEJ","ABCEFGHI":"HGBCAFEI","ABCDIJKL":"IJBCADLK","ABCDHJKL":"HJBCADLK","ABCDHIKL":"HIBCADLK","ABCDHIJL":"HJBCADLI","ABCDHIJK":"HJBCADIK","ABCDGJKL":"CJBDAGLK","ABCDGIKL":"IGBCADLK","ABCDGIJL":"CJBDAGLI","ABCDGIJK":"CJBDAGIK","ABCDGHKL":"HGBCADLK","ABCDGHJL":"HGBCADLJ","ABCDGHJK":"HGBCADJK","ABCDGHIL":"HGBCADLI","ABCDGHIK":"HGBCADIK","ABCDGHIJ":"HGBCADIJ","ABCDFJKL":"CJBDAFLK","ABCDFIKL":"CIBDAFLK","ABCDFIJL":"CJBDAFLI","ABCDFIJK":"CJBDAFIK","ABCDFHKL":"HFBCADLK","ABCDFHJL":"CJBDAFLH","ABCDFHJK":"HJBCAFDK","ABCDFHIL":"HFBCADLI","ABCDFHIK":"HFBCADIK","ABCDFHIJ":"HJBCAFDI","ABCDFGKL":"CGBDAFLK","ABCDFGJL":"CGBDAFLJ","ABCDFGJK":"CGBDAFJK","ABCDFGIL":"CGBDAFLI","ABCDFGIK":"CGBDAFIK","ABCDFGIJ":"CGBDAFIJ","ABCDFGHL":"CGBDAFLH","ABCDFGHK":"HGBCAFDK","ABCDFGHJ":"HGBCAFDJ","ABCDFGHI":"HGBCAFDI","ABCDEJKL":"EJBCADLK","ABCDEIKL":"EIBCADLK","ABCDEIJL":"EJBCADLI","ABCDEIJK":"EJBCADIK","ABCDEHKL":"HEBCADLK","ABCDEHJL":"HJBCADLE","ABCDEHJK":"HJBCADEK","ABCDEHIL":"HEBCADLI","ABCDEHIK":"HEBCADIK","ABCDEHIJ":"HJBCADEI","ABCDEGKL":"EGBCADLK","ABCDEGJL":"EGBCADLJ","ABCDEGJK":"EGBCADJK","ABCDEGIL":"EGBCADLI","ABCDEGIK":"EGBCADIK","ABCDEGIJ":"EGBCADIJ","ABCDEGHL":"HGBCADLE","ABCDEGHK":"HGBCADEK","ABCDEGHJ":"HGBCADEJ","ABCDEGHI":"HGBCADEI","ABCDEFKL":"CEBDAFLK","ABCDEFJL":"CJBDAFLE","ABCDEFJK":"CJBDAFEK","ABCDEFIL":"CEBDAFLI","ABCDEFIK":"CEBDAFIK","ABCDEFIJ":"CJBDAFEI","ABCDEFHL":"HFBCADLE","ABCDEFHK":"HEBCAFDK","ABCDEFHJ":"HJBCAFDE","ABCDEFHI":"HEBCAFDI","ABCDEFGL":"CGBDAFLE","ABCDEFGK":"CGBDAFEK","ABCDEFGJ":"CGBDAFEJ","ABCDEFGI":"CGBDAFEI","ABCDEFGH":"HGBCAFDE"};
export const COL: Record<string, number> = {A:0,B:1,D:2,E:3,G:4,I:5,K:6,L:7}; // group-winner -> Annex column

export const TEAMS: Record<string, [string, string, number][]> = {
 A:[["Mexico","🇲🇽",78],["South Africa","🇿🇦",68],["South Korea","🇰🇷",76],["Czechia","🇨🇿",73]],
 B:[["Canada","🇨🇦",74],["Bosnia & Herzegovina","🇧🇦",71],["Qatar","🇶🇦",69],["Switzerland","🇨🇭",80]],
 C:[["Brazil","🇧🇷",90],["Morocco","🇲🇦",83],["Haiti","🇭🇹",58],["Scotland","🏴󠁧󠁢󠁳󠁣󠁴󠁿",72]],
 D:[["United States","🇺🇸",78],["Paraguay","🇵🇾",72],["Australia","🇦🇺",74],["Türkiye","🇹🇷",79]],
 E:[["Germany","🇩🇪",86],["Curaçao","🇨🇼",59],["Ivory Coast","🇨🇮",74],["Ecuador","🇪🇨",77]],
 F:[["Netherlands","🇳🇱",88],["Japan","🇯🇵",79],["Sweden","🇸🇪",74],["Tunisia","🇹🇳",71]],
 G:[["Belgium","🇧🇪",85],["Egypt","🇪🇬",74],["Iran","🇮🇷",76],["New Zealand","🇳🇿",63]],
 H:[["Spain","🇪🇸",95],["Cape Verde","🇨🇻",64],["Saudi Arabia","🇸🇦",69],["Uruguay","🇺🇾",84]],
 I:[["France","🇫🇷",93],["Senegal","🇸🇳",80],["Iraq","🇮🇶",67],["Norway","🇳🇴",80]],
 J:[["Argentina","🇦🇷",94],["Algeria","🇩🇿",74],["Austria","🇦🇹",77],["Jordan","🇯🇴",66]],
 K:[["Portugal","🇵🇹",90],["Congo DR","🇨🇩",70],["Uzbekistan","🇺🇿",68],["Colombia","🇨🇴",83]],
 L:[["England","🏴󠁧󠁢󠁥󠁮󠁧󠁿",92],["Croatia","🇭🇷",82],["Ghana","🇬🇭",72],["Panama","🇵🇦",67]]
};
export const GROUPS: string[] = Object.keys(TEAMS);
export const BYID: Record<string, Team> = {};
GROUPS.forEach((g)=>TEAMS[g].forEach((t,i)=>{const id=g+i;BYID[id]={id,group:g,name:t[0],flag:t[1],rating:t[2]};}));

// ---- Bracket structure (official) ----
export const R32: Match[] = [
 {id:73,a:{t:'ru',g:'A'},b:{t:'ru',g:'B'}},
 {id:74,a:{t:'w',g:'E'},b:{t:'3w',wg:'E'}},
 {id:75,a:{t:'w',g:'F'},b:{t:'ru',g:'C'}},
 {id:76,a:{t:'w',g:'C'},b:{t:'ru',g:'F'}},
 {id:77,a:{t:'w',g:'I'},b:{t:'3w',wg:'I'}},
 {id:78,a:{t:'ru',g:'E'},b:{t:'ru',g:'I'}},
 {id:79,a:{t:'w',g:'A'},b:{t:'3w',wg:'A'}},
 {id:80,a:{t:'w',g:'L'},b:{t:'3w',wg:'L'}},
 {id:81,a:{t:'w',g:'D'},b:{t:'3w',wg:'D'}},
 {id:82,a:{t:'w',g:'G'},b:{t:'3w',wg:'G'}},
 {id:83,a:{t:'ru',g:'K'},b:{t:'ru',g:'L'}},
 {id:84,a:{t:'w',g:'H'},b:{t:'ru',g:'J'}},
 {id:85,a:{t:'w',g:'B'},b:{t:'3w',wg:'B'}},
 {id:86,a:{t:'w',g:'J'},b:{t:'ru',g:'H'}},
 {id:87,a:{t:'w',g:'K'},b:{t:'3w',wg:'K'}},
 {id:88,a:{t:'ru',g:'D'},b:{t:'ru',g:'G'}},
];
export const R16: Match[] = [
 {id:89,a:{t:'mw',m:74},b:{t:'mw',m:77}},
 {id:90,a:{t:'mw',m:73},b:{t:'mw',m:75}},
 {id:91,a:{t:'mw',m:76},b:{t:'mw',m:78}},
 {id:92,a:{t:'mw',m:79},b:{t:'mw',m:80}},
 {id:93,a:{t:'mw',m:83},b:{t:'mw',m:84}},
 {id:94,a:{t:'mw',m:81},b:{t:'mw',m:82}},
 {id:95,a:{t:'mw',m:86},b:{t:'mw',m:88}},
 {id:96,a:{t:'mw',m:85},b:{t:'mw',m:87}},
];
export const QF: Match[] = [
 {id:97,a:{t:'mw',m:89},b:{t:'mw',m:90}},
 {id:98,a:{t:'mw',m:93},b:{t:'mw',m:94}},
 {id:99,a:{t:'mw',m:91},b:{t:'mw',m:92}},
 {id:100,a:{t:'mw',m:95},b:{t:'mw',m:96}},
];
export const SF: Match[] = [
 {id:101,a:{t:'mw',m:97},b:{t:'mw',m:98}},
 {id:102,a:{t:'mw',m:99},b:{t:'mw',m:100}},
];
export const FINAL: Match = {id:104,a:{t:'mw',m:101},b:{t:'mw',m:102}};
export const THIRDM: Match = {id:103,a:{t:'ml',m:101},b:{t:'ml',m:102}};
export const ALLM: Match[] = [...R32,...R16,...QF,...SF,THIRDM,FINAL];
export const MById: Record<number, Match> = {}; ALLM.forEach((m)=>{MById[m.id]=m;});
export const ROUNDS: Round[] = [
 {key:'R32',title:'Round of 32',date:'Jun 28 – Jul 3',ms:R32},
 {key:'R16',title:'Round of 16',date:'Jul 4 – 7',ms:R16},
 {key:'QF',title:'Quarter-finals',date:'Jul 9 – 11',ms:QF},
 {key:'SF',title:'Semi-finals',date:'Jul 14 – 15',ms:SF},
 {key:'3RD',title:'3rd Place',date:'Jul 18 · Miami',ms:[THIRDM]},
 {key:'FIN',title:'Final',date:'Jul 19 · NJ',ms:[FINAL]},
];

// ---- Pure bracket logic (state = {order, thirds, picks}) ----
// order: { [group]: [id,id,id,id] }
// thirds: Set<groupLetter> (size 8 when complete)
// picks:  { [matchId]: teamId }

export function teamsOf(order: Record<string, string[]>, g: string): Team[] {
  return (order[g] || []).map((id) => BYID[id]);
}

export function annexKey(thirds: Set<string>): string {
  return [...thirds].sort().join('');
}

export function resolve(s: Slot | null | undefined, state: State): Team | null {
  const { order, thirds, picks } = state;
  if (!s) return null;
  if (s.t === 'w') { const o = order[s.g]; return o && o.length >= 1 ? BYID[o[0]] : null; }
  if (s.t === 'ru') { const o = order[s.g]; return o && o.length >= 2 ? BYID[o[1]] : null; }
  if (s.t === '3w') {
    if (thirds.size !== 8) return null;
    const v = ANNEX[annexKey(thirds)]; if (!v) return null;
    const ag = v[COL[s.wg]]; const o = order[ag];
    return o && o.length >= 3 ? BYID[o[2]] : null;
  }
  if (s.t === 'mw') { const tid = picks[s.m]; return tid ? BYID[tid] : null; }
  if (s.t === 'ml') {
    const m = MById[s.m]; const ta = resolve(m.a, state), tb = resolve(m.b, state), tid = picks[s.m];
    if (!ta || !tb || !tid) return null; return tid === ta.id ? tb : ta;
  }
  return null;
}

// Returns a cleaned copy of picks with any now-invalid picks removed.
export function validatePicks(state: State): Record<number, string> {
  const picks: Record<number, string> = { ...state.picks };
  const next: State = { ...state, picks };
  let changed = true, pass = 0;
  while (changed && pass++ < 10) {
    changed = false;
    for (const m of ALLM) {
      const p = picks[m.id]; if (p === undefined) continue;
      const ta = resolve(m.a, next), tb = resolve(m.b, next);
      if (!ta || !tb || (p !== ta.id && p !== tb.id)) { delete picks[m.id]; changed = true; }
    }
  }
  return picks;
}

export const groupsDone = (order: Record<string, string[]>): number =>
  GROUPS.filter((g) => (order[g] || []).length >= 3).length;
export const allGroups = (order: Record<string, string[]>): boolean => groupsDone(order) === 12;
export const champion = (state: State): Team | null => resolve({ t: 'mw', m: 104 }, state);

export function placeholder(s: Slot): string {
  if (s.t === 'w') return 'Winner Group ' + s.g;
  if (s.t === 'ru') return 'Runner-up ' + s.g;
  if (s.t === '3w') return 'Best 3rd place';
  if (s.t === 'mw') return 'Winner of #' + s.m;
  if (s.t === 'ml') return 'Loser of #' + s.m;
  return '';
}
