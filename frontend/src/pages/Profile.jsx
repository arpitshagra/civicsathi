import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      {/* Profile Header Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        {/* User Info Card */}
        <div className="glass-card rounded-xl p-md md:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-md">
          <div className="relative group">
            {user?.photoURL ? (
              <img
                alt="User Profile Picture"
                className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-sm"
                src={user.photoURL}
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-surface shadow-sm bg-surface-container-high flex items-center justify-center text-primary">
                {user?.displayName ? (
                  <span className="font-display-lg text-display-lg">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "96px", fontVariationSettings: "'FILL' 1" }}
                  >
                    account_circle
                  </span>
                )}
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                edit
              </span>
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
              {user?.displayName || "Your Name"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-sm">
              {user?.email || ""}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm">
                <span
                  className="material-symbols-outlined text-[16px] text-tertiary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                KYC Verified
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm">
                <span
                  className="material-symbols-outlined text-[16px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  badge
                </span>
                Citizen ID Linked
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-2 bg-surface-container border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors active:scale-95 flex items-center justify-center gap-2">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                settings
              </span>
              Settings
            </button>
            <button
              onClick={logout}
              className="w-full sm:w-auto px-6 py-2 bg-surface-container border border-outline-variant text-error rounded-lg font-label-md text-label-md hover:bg-error-container transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                logout
              </span>
              Sign Out
            </button>
          </div>
        </div>
        {/* AI Quick Stats Card */}
        <div className="ai-glass-card rounded-xl p-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
              <h2 className="font-headline-md text-headline-md text-primary">
                CivicSathi Insights
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your profile is 85% complete. Adding your latest tax return can
              unlock 3 new potential schemes.
            </p>
          </div>
          <button className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors active:scale-95 w-full">
            Complete Profile
          </button>
        </div>
      </div>
      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-md">
          {/* Saved Schemes */}
          <section className="glass-card rounded-xl p-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  bookmark
                </span>
                Saved Schemes
              </h2>
              <button className="text-primary font-label-sm text-label-sm hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* Scheme Card 1 */}
              <div className="p-4 border border-surface-variant rounded-lg hover:shadow-sm transition-shadow bg-surface-lowest">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                    Pradhan Mantri Awas Yojana (Urban)
                  </h3>
                  <span className="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                    Eligible
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-4">
                  Housing for All scheme aiming to provide affordable housing to
                  urban poor.
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      update
                    </span>
                    Saved 2 days ago
                  </span>
                  <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                    Apply Now
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
              {/* Scheme Card 2 */}
              <div className="p-4 border border-surface-variant rounded-lg hover:shadow-sm transition-shadow bg-surface-lowest">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                    Ayushman Bharat
                  </h3>
                  <span className="bg-secondary-container/20 text-on-secondary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                    Pending Docs
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-4">
                  National Health Protection Scheme for low-income citizens.
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      update
                    </span>
                    Saved 1 week ago
                  </span>
                  <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                    Continue
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          {/* Complaint History */}
          <section className="glass-card rounded-xl p-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  report_problem
                </span>
                Grievance History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-variant text-on-surface-variant font-label-sm text-label-sm">
                    <th className="py-3 px-2 font-semibold">ID</th>
                    <th className="py-3 px-2 font-semibold">Category</th>
                    <th className="py-3 px-2 font-semibold">Date</th>
                    <th className="py-3 px-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  <tr className="border-b border-surface-variant/50 hover:bg-surface-container-low/50">
                    <td className="py-3 px-2 text-primary">#G-4029</td>
                    <td className="py-3 px-2 text-on-surface">
                      Municipal Water Supply
                    </td>
                    <td className="py-3 px-2 text-on-surface-variant">
                      12 Oct 2023
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                        Resolved
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-surface-variant/50 hover:bg-surface-container-low/50">
                    <td className="py-3 px-2 text-primary">#G-4105</td>
                    <td className="py-3 px-2 text-on-surface">
                      Property Tax Assessment
                    </td>
                    <td className="py-3 px-2 text-on-surface-variant">
                      28 Nov 2023
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-secondary-container/20 text-on-secondary-container px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                        In Progress
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
        {/* Right Column (Narrower) */}
        <div className="space-y-md">
          {/* Saved Checklists */}
          <section className="glass-card rounded-xl p-md h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  checklist
                </span>
                Checklists
              </h2>
            </div>
            <div className="space-y-4">
              {/* Checklist Item */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant/50">
                <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-2">
                  Passport Renewal
                </h3>
                <div className="w-full bg-surface-variant rounded-full h-1.5 mb-2">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>3 of 4 Docs</span>
                  <span>75%</span>
                </div>
              </div>
              {/* Checklist Item */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant/50">
                <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-2">
                  Voter ID Correction
                </h3>
                <div className="w-full bg-surface-variant rounded-full h-1.5 mb-2">
                  <div
                    className="bg-secondary h-1.5 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>1 of 4 Docs</span>
                  <span>25%</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-outline border-dashed text-on-surface-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 font-label-md text-label-md">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                add
              </span>
              Create New Checklist
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
