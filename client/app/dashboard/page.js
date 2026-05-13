"use client";

/**
 * Dashboard Page — Role-based view with tabs
 *
 * Dealer: Stats + [My Listings | Inquiries] tabs + New Listing button
 * Buyer: Profile info + sent inquiries list + Browse Cars CTA
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [cars, setCars] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [isPending, session, router]);

  // Fetch dealer's listings + inquiries
  useEffect(() => {
    if (session?.user?.role === "dealer") {
      fetchMyCars();
      fetchMyInquiries();
    } else if (session?.user?.role === "buyer" || (session && !session.user.role)) {
      fetchSentInquiries();
    }
  }, [session]);

  async function fetchMyCars() {
    setLoadingCars(true);
    try {
      const res = await fetch(`${API}/api/cars/mine`, { credentials: "include" });
      setCars(await res.json());
    } catch (err) { console.error(err); }
    setLoadingCars(false);
  }

  async function fetchMyInquiries() {
    setLoadingInquiries(true);
    try {
      const res = await fetch(`${API}/api/inquiries/mine`, { credentials: "include" });
      setInquiries(await res.json());
    } catch (err) { console.error(err); }
    setLoadingInquiries(false);
  }

  async function fetchSentInquiries() {
    setLoadingInquiries(true);
    try {
      const res = await fetch(`${API}/api/inquiries/sent`, { credentials: "include" });
      setInquiries(await res.json());
    } catch (err) { console.error(err); }
    setLoadingInquiries(false);
  }

  async function handleDelete(carId) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`${API}/api/cars/${carId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) setCars((prev) => prev.filter((c) => c._id !== carId));
    } catch (err) { console.error(err); }
  }

  // Helper: format relative time (e.g., "2 hours ago")
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isDealer = session.user.role === "dealer";

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ─── Welcome Header ─── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-muted mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold text-foreground">{session.user.name}</h1>
          </div>
          {isDealer && (
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              + New Listing
            </Link>
          )}
        </div>

        {isDealer ? (
          /* ─── DEALER VIEW ─── */
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Total Listings</p>
                <p className="text-2xl font-bold text-foreground">{cars.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{cars.reduce((sum, c) => sum + c.price, 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-5 hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Inquiries</p>
                <p className="text-2xl font-bold text-foreground">{inquiries.length}</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab("listings")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "listings"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "inquiries"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                Inquiries {inquiries.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {inquiries.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content: Listings */}
            {activeTab === "listings" && (
              <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                {loadingCars ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm text-muted ml-2">Loading...</p>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-3 block">🚗</span>
                    <p className="text-sm font-semibold text-foreground mb-1">No listings yet</p>
                    <p className="text-xs text-muted mb-4">Create your first car listing.</p>
                    <Link href="/dashboard/new" className="text-sm font-semibold text-primary hover:underline">
                      + Create Listing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {cars.map((car) => (
                      <div key={car._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                        <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-border">
                          {car.images?.[0] ? (
                            <img src={car.images[0].url} alt={car.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg">🚗</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{car.title}</p>
                          <p className="text-xs text-muted">{car.brand} · {car.year} · ₹{car.price.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href={`/dashboard/edit/${car._id}`}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-slate-50 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(car._id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Inquiries */}
            {activeTab === "inquiries" && (
              <div className="space-y-3">
                {loadingInquiries ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm text-muted ml-2">Loading inquiries...</p>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-border bg-white">
                    <span className="text-4xl mb-3 block">📩</span>
                    <p className="text-sm font-semibold text-foreground mb-1">No inquiries yet</p>
                    <p className="text-xs text-muted">When buyers inquire about your listings, they'll appear here.</p>
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div key={inq._id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-foreground">{inq.name}</p>
                          <p className="text-xs text-muted">📞 {inq.phone}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{timeAgo(inq.createdAt)}</span>
                      </div>
                      {inq.car && (
                        <Link
                          href={`/cars/${inq.car._id}`}
                          className="inline-block mb-2 text-xs font-semibold text-primary hover:underline"
                        >
                          🚗 {inq.car.title} — ₹{inq.car.price?.toLocaleString("en-IN")}
                        </Link>
                      )}
                      <p className="text-sm text-muted leading-relaxed">{inq.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          /* ─── BUYER VIEW ─── */
          <>
            {/* Profile Card */}
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Your Profile</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Email</dt>
                  <dd className="text-sm font-medium text-foreground">{session.user.email}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Account Role</dt>
                  <dd className="text-sm font-medium text-foreground capitalize">{session.user.role || "buyer"}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Member Since</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {new Date(session.user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Inquiries Sent</dt>
                  <dd className="text-sm font-medium text-foreground">{inquiries.length}</dd>
                </div>
              </dl>
            </div>

            {/* Sent Inquiries */}
            {inquiries.length > 0 && (
              <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Your Inquiries</h2>
                </div>
                <div className="divide-y divide-border">
                  {inquiries.map((inq) => (
                    <div key={inq._id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-1">
                        {inq.car ? (
                          <Link
                            href={`/cars/${inq.car._id}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            🚗 {inq.car.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-bold text-muted">(Listing removed)</span>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(inq.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted">{inq.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse CTA */}
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
              <span className="text-4xl mb-3 block">🚗</span>
              <h3 className="text-lg font-bold text-foreground mb-1">Ready to find your next car?</h3>
              <p className="text-sm text-muted mb-4">Browse listings from trusted dealers.</p>
              <Link
                href="/cars"
                className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Browse Cars →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
