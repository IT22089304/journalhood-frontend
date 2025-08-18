export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", phoneCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44" },
  { code: "AU", name: "Australia", flag: "🇦🇺", phoneCode: "+61" },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "+91" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", phoneCode: "+94" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", phoneCode: "+880" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", phoneCode: "+92" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", phoneCode: "+977" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", phoneCode: "+65" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", phoneCode: "+60" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", phoneCode: "+66" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", phoneCode: "+63" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", phoneCode: "+62" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", phoneCode: "+84" },
  { code: "JP", name: "Japan", flag: "🇯🇵", phoneCode: "+81" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", phoneCode: "+82" },
  { code: "CN", name: "China", flag: "🇨🇳", phoneCode: "+86" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", phoneCode: "+852" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", phoneCode: "+886" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", phoneCode: "+971" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", phoneCode: "+966" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", phoneCode: "+974" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", phoneCode: "+965" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", phoneCode: "+973" },
  { code: "OM", name: "Oman", flag: "🇴🇲", phoneCode: "+968" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", phoneCode: "+20" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", phoneCode: "+27" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", phoneCode: "+234" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", phoneCode: "+254" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", phoneCode: "+233" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", phoneCode: "+256" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", phoneCode: "+255" },
  { code: "FR", name: "France", flag: "🇫🇷", phoneCode: "+33" },
  { code: "DE", name: "Germany", flag: "🇩🇪", phoneCode: "+49" },
  { code: "IT", name: "Italy", flag: "🇮🇹", phoneCode: "+39" },
  { code: "ES", name: "Spain", flag: "🇪🇸", phoneCode: "+34" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", phoneCode: "+31" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", phoneCode: "+32" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", phoneCode: "+41" },
  { code: "AT", name: "Austria", flag: "🇦🇹", phoneCode: "+43" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", phoneCode: "+46" },
  { code: "NO", name: "Norway", flag: "🇳🇴", phoneCode: "+47" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", phoneCode: "+45" },
  { code: "FI", name: "Finland", flag: "🇫🇮", phoneCode: "+358" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phoneCode: "+55" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", phoneCode: "+52" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", phoneCode: "+54" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", phoneCode: "+57" },
  { code: "PE", name: "Peru", flag: "🇵🇪", phoneCode: "+51" },
  { code: "CL", name: "Chile", flag: "🇨🇱", phoneCode: "+56" },
  { code: "RU", name: "Russia", flag: "🇷🇺", phoneCode: "+7" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", phoneCode: "+90" },
  { code: "IR", name: "Iran", flag: "🇮🇷", phoneCode: "+98" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", phoneCode: "+964" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", phoneCode: "+962" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", phoneCode: "+961" },
  { code: "IL", name: "Israel", flag: "🇮🇱", phoneCode: "+972" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", phoneCode: "+970" },
].sort((a, b) => a.name.localeCompare(b.name));

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(country => country.phoneCode === phoneCode);
};

export const getDefaultCountry = (): Country => {
  return countries.find(country => country.code === "US") || countries[0];
}; 