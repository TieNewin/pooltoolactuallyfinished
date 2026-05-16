'use client';

import { useMemo, useState } from 'react';
import { pools } from '@/data/pools';
import { packages } from '@/data/packages';
import { upgrades } from '@/data/upgrades';

export default function HomePage() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [size, setSize] = useState('');
  const [liner, setLiner] = useState('');
  const [packageName, setPackageName] = useState('');
  const [partiallyBuried, setPartiallyBuried] = useState(false);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);

  const selectedPool = useMemo(() => {
    return pools.find(
      (p) => p.brand === brand && p.model === model && p.size === size
    );
  }, [brand, model, size]);

  const selectedLiner = selectedPool?.liners.find((l) => l.name === liner);

  const selectedPackage = packages.find((p) => p.name === packageName);

  const models = Array.from(
    new Set(pools.filter((p) => p.brand === brand).map((p) => p.model))
  );

  const sizes = pools
    .filter((p) => p.brand === brand && p.model === model)
    .map((p) => p.size);

  const liners = selectedPool?.liners ?? [];

  const retailPrice = selectedPool?.retailPrice ?? 0;
  const internalCost = selectedPool?.internalCost ?? 0;
  const baseInstall = selectedPool?.installLabor ?? 0;
  const sep = selectedPool?.sep ?? 0;
  const shape = selectedPool?.shape ?? '';

  const linerPrice = selectedLiner?.price ?? 0;
  const packagePrice = selectedPackage?.price ?? 0;

  const installLabor = partiallyBuried ? baseInstall * 2 : baseInstall;

  const upgradeTotal = upgrades
    .filter((upgrade) => selectedUpgrades.includes(upgrade.name))
    .reduce((total, upgrade) => total + upgrade.price, 0);

  const upgradeCostTotal = upgrades
    .filter((upgrade) => selectedUpgrades.includes(upgrade.name))
    .reduce((total, upgrade) => total + upgrade.internalCost, 0);

  const subtotal =
    retailPrice + linerPrice + packagePrice + upgradeTotal + installLabor + sep;

  const taxRate = 0.0825;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const totalCost = subtotal / 2;

  const profit = subtotal - totalCost;
  const commission = profit * 0.1;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">Pool Quoting Tool</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-xl font-semibold">Quote Builder</h2>

            <Label>Brand</Label>
            <select
              className="mb-4 w-full rounded border p-2"
              value={brand}
              onChange={(e) => {
                const nextBrand = e.target.value;
                const first = pools.find((p) => p.brand === nextBrand);

                setBrand(nextBrand);

                if (first) {
                  setModel(first.model);
                  setSize(first.size);
                  setLiner(first.liners[0].name);
                }
              }}
            >
              <option value="">Select Brand</option>
              <option>Calibay</option>
              <option>Doughboy</option>
            </select>

            <Label>Pool Model</Label>
            <select
              className="mb-4 w-full rounded border p-2"
              value={model}
              onChange={(e) => {
                const nextModel = e.target.value;

                const first = pools.find(
                  (p) => p.brand === brand && p.model === nextModel
                );

                setModel(nextModel);

                if (first) {
                  setSize(first.size);
                  setLiner(first.liners[0].name);
                }
              }}
            >
              {models.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <Label>Size</Label>
            <select
              className="mb-4 w-full rounded border p-2"
              value={size}
              onChange={(e) => {
                const nextSize = e.target.value;
                setSize(nextSize);

                const nextPool = pools.find(
                  (p) =>
                    p.brand === brand &&
                    p.model === model &&
                    p.size === nextSize
                );

                if (nextPool) {
                  setLiner(nextPool.liners[0].name);
                }
              }}
            >
              {sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <Label>Liner</Label>
            <select
              className="mb-4 w-full rounded border p-2"
              value={liner}
              onChange={(e) => setLiner(e.target.value)}
            >
              {liners.map((l) => (
                <option key={l.name}>{l.name}</option>
              ))}
            </select>

            <Label>Equipment Package</Label>
            <select
              className="mb-4 w-full rounded border p-2"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            >
              {packages.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>

            <div className="mb-4 rounded bg-slate-100 p-3 text-sm">
              Shape: <strong>{shape}</strong>
            </div>

            <label className="mb-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={partiallyBuried}
                onChange={(e) => setPartiallyBuried(e.target.checked)}
              />
              Partially buried install
            </label>

            <div>
              <Label>Optional Upgrades</Label>

              <div className="space-y-2">
                {upgrades.map((upgrade) => (
                  <label
                    key={upgrade.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUpgrades.includes(upgrade.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUpgrades([
                            ...selectedUpgrades,
                            upgrade.name,
                          ]);
                        } else {
                          setSelectedUpgrades(
                            selectedUpgrades.filter(
                              (name) => name !== upgrade.name
                            )
                          );
                        }
                      }}
                    />
                    {upgrade.name} — {money(upgrade.price)}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-xl font-semibold">Customer Quote</h2>

            <Row label="Pool Price" value={money(retailPrice)} />
            <Row label="Liner Upgrade" value={money(linerPrice)} />
            <Row label="Package" value={money(packagePrice)} />
            <Row label="Optional Upgrades" value={money(upgradeTotal)} />
            <Row label="Install" value={money(installLabor)} />
            <Row label="SEP" value={money(sep)} />
            <Row label="Tax" value={money(tax)} />

            <hr className="my-3" />

            <Row label="Total" value={money(total)} large />
          </section>

          <section className="rounded-xl border bg-slate-50 p-4">
            <h2 className="mb-4 text-xl font-semibold">Internal Breakdown</h2>

            <Row label="Subtotal" value={money(subtotal)} />
            <Row label="Internal Cost" value={money(totalCost)} />
            <Row label="Upgrade Cost" value={money(upgradeCostTotal)} />
            <Row label="Gross Profit" value={money(profit)} />
            <Row label="Commission" value={money(commission)} large />
          </section>
        </div>
      </div>
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium">{children}</label>;
}

function Row({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-1 ${
        large ? 'text-lg font-bold' : ''
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function money(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
