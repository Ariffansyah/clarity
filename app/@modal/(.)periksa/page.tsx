import Checker from "@/app/checker";
import PhoneModal from "@/app/phone-modal";

export { metadata } from "@/app/periksa/page";

export default function PeriksaModal() {
  return (
    <PhoneModal title="Cek Pesan">
      <Checker aiReady={!!process.env.GROQ_API_KEY} compact />
    </PhoneModal>
  );
}
