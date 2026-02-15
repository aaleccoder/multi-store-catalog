export interface PhoneCountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const DEFAULT_PHONE_COUNTRY_CODE = "US";

export const PHONE_COUNTRY_OPTIONS: PhoneCountryOption[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻" },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮" },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾" },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
];

const PHONE_COUNTRY_BY_CODE = PHONE_COUNTRY_OPTIONS.reduce<
  Record<string, PhoneCountryOption>
>((acc, country) => {
  acc[country.code] = country;
  return acc;
}, {});

const PHONE_DIAL_CODES_DESC = Array.from(
  new Set(PHONE_COUNTRY_OPTIONS.map((country) => country.dialCode)),
).sort((a, b) => b.length - a.length);

const E164_PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

export const normalizePhoneNumber = (value?: string | null) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return undefined;

  const withInternationalPrefix = trimmed.startsWith("+")
    ? trimmed
    : trimmed.startsWith("00")
      ? `+${trimmed.slice(2)}`
      : `+${trimmed}`;

  const digits = withInternationalPrefix.replace(/\D/g, "");
  if (!digits) return undefined;

  return `+${digits}`;
};

export const isValidE164PhoneNumber = (value?: string | null) => {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return false;

  return E164_PHONE_PATTERN.test(normalized);
};

export const getPhoneCountry = (countryCode?: string | null) => {
  const normalizedCountryCode = countryCode?.toUpperCase();
  if (normalizedCountryCode && PHONE_COUNTRY_BY_CODE[normalizedCountryCode]) {
    return PHONE_COUNTRY_BY_CODE[normalizedCountryCode];
  }

  return PHONE_COUNTRY_BY_CODE[DEFAULT_PHONE_COUNTRY_CODE];
};

export const splitPhoneNumber = (value?: string | null) => {
  const fallbackCountry = getPhoneCountry(DEFAULT_PHONE_COUNTRY_CODE);
  const normalizedPhone = normalizePhoneNumber(value);

  if (!normalizedPhone) {
    return {
      countryCode: fallbackCountry.code,
      dialCode: fallbackCountry.dialCode,
      nationalNumber: "",
    };
  }

  const digits = normalizedPhone.slice(1);
  const matchedDialCode = PHONE_DIAL_CODES_DESC.find((dialCode) =>
    digits.startsWith(dialCode.slice(1)),
  );

  if (!matchedDialCode) {
    return {
      countryCode: fallbackCountry.code,
      dialCode: fallbackCountry.dialCode,
      nationalNumber: digits,
    };
  }

  const matchedCountry =
    PHONE_COUNTRY_OPTIONS.find((country) => country.dialCode === matchedDialCode) ??
    fallbackCountry;

  return {
    countryCode: matchedCountry.code,
    dialCode: matchedDialCode,
    nationalNumber: digits.slice(matchedDialCode.length - 1),
  };
};

export const composePhoneNumber = (
  countryCode: string,
  nationalNumber: string,
) => {
  const country = getPhoneCountry(countryCode);
  const digits = nationalNumber.replace(/\D/g, "");

  if (!digits) return undefined;

  return normalizePhoneNumber(`${country.dialCode}${digits}`);
};
