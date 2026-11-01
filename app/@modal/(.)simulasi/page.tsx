import PhoneModal from "@/app/phone-modal";
import Sim from "@/app/simulasi/sim";

export { metadata } from "@/app/simulasi/page";

export default function SimulasiModal() {
  return (
    <PhoneModal title="Simulasi" note="tenang, penipunya diperankan AI">
      <Sim ready={!!process.env.GROQ_API_KEY} />
    </PhoneModal>
  );
}
