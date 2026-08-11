"use client";

import { useState } from "react";
import { GCASH_QR_SRC, SUPPORT_LINKS } from "@/lib/support";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { CompanionAvatar } from "./CompanionAvatar";
import { Modal } from "./Modal";

function GcashPanel() {
  // The QR is a drop-in file, so it may legitimately not be there yet.
  // Rather than a broken image, say what's missing and where it goes.
  const [missing, setMissing] = useState(false);

  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-ink bg-white p-5">
      <span className="mono-label mb-3 opacity-70">Scan with GCash</span>

      {missing ? (
        <div className="grid aspect-square w-44 place-content-center gap-1 rounded-xl border-2 border-dashed border-ink/25 p-4 text-center">
          <p className="text-sm font-semibold">No QR yet</p>
          <p className="text-sm leading-snug opacity-70">
            Save your GCash QR to
            <br />
            <code className="font-mono">public/gcash-qr.png</code>
          </p>
        </div>
      ) : (
        /* A local static asset with no known intrinsic size — next/image would
           need width/height for a file that may not exist yet. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={GCASH_QR_SRC}
          alt="GCash QR code for sending support"
          width={176}
          height={176}
          onError={() => setMissing(true)}
          className="h-44 w-44 rounded-xl object-contain"
        />
      )}

      <p className="mt-3 text-center text-sm opacity-70">
        Open GCash → Send Money → Scan QR
      </p>
    </div>
  );
}

export function SupportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Support Porolambing"
      subtitle="Porolambing is free, has no ads, and never sends your data anywhere. If it's been useful, this keeps it going."
    >
      <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-ink bg-blush/30 p-4">
        <CompanionAvatar className="h-11 w-11 shrink-0" mood="excited" />
        <p className="text-sm">
          Salamat sa pag-focus kasama ako. Kahit tingin lang, okay na — pero
          kung may extra ka, ito o.
        </p>
      </div>

      <div className="grid gap-4 pb-5 sm:grid-cols-2">
        <GcashPanel />

        <div className="flex flex-col justify-between gap-4 rounded-2xl border-2 border-ink bg-white p-5">
          <div>
            <span className="mono-label opacity-70">Card or PayPal</span>
            <p className="mt-2 text-sm opacity-70">
              Buy Me a Coffee handles anything that isn&apos;t GCash — cards,
              PayPal, one-off or monthly.
            </p>
          </div>
          <a
            href={SUPPORT_LINKS.buyMeACoffee}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("solid", "md", "w-full")}
          >
            <span aria-hidden>☕</span>
            Buy me a coffee
          </a>
        </div>
      </div>
    </Modal>
  );
}
