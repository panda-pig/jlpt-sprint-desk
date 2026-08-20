/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getLocale, setLocale as setGlobalLocale, subscribeLocale, t as translate, tOption as translateOption, type Locale } from "./index";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tOption: (group: string, value: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => subscribeLocale(() => setLocaleState(getLocale())), []);

  const setLocale = useCallback((l: Locale) => setGlobalLocale(l), []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translate, tOption: translateOption }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT() {
  return useLocale().t;
}
