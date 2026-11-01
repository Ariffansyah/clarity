import Sections from "@/app/bertindak/sections";
import PhoneModal from "@/app/phone-modal";

export { metadata } from "@/app/bertindak/page";

export default function BertindakModal() {
  return (
    <PhoneModal title="Sudah Terlanjur?" note="tarik napas dulu, ya">
      <Sections />
    </PhoneModal>
  );
}
