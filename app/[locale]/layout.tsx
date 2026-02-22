import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <WhatsAppButton />
    </>
  );
}
