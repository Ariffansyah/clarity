import { analyze } from "@/lib/analyze";
import Marked from "./marked";

// The real analyzer output for a fictional message, so the example shows exactly what the tool does.
const TEXT =
  "Nasabah Yth, akun m-banking Anda akan diblokir dalam 24 jam karena perubahan tarif transfer. Segera konfirmasi di nusantara-tarif-baru.top/konfirmasi";
const SPANS = analyze(TEXT).spans;

// What a result looks like: the message, highlighted, with red-pen notes under it the way you'd mark up a printout.
export default function Contoh() {
  return (
    <figure aria-hidden className="rounded border-[1.5px] border-dashed border-line p-4">
      <p className="text-sm font-bold">
        +62 812-xxxx-0077 <span className="font-normal text-muted">· SMS</span>
      </p>
      <p className="mt-2 leading-[1.8]">
        <Marked text={TEXT} spans={SPANS} />
      </p>
      <figcaption className="hand mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xl">
        <span>diancam diblokir?</span>
        <span>kok buru-buru?</span>
        <span>link aneh!</span>
      </figcaption>
    </figure>
  );
}
