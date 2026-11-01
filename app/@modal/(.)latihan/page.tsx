import Trainer from "@/app/latihan/trainer";
import PhoneModal from "@/app/phone-modal";

export { metadata } from "@/app/latihan/page";

export default function LatihanModal() {
  return (
    <PhoneModal title="Latihan" note="semua situasinya fiktif">
      <Trainer />
    </PhoneModal>
  );
}
