export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <p className="text-slate-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">1. Acceptance of Terms</h2>
                        <p>By accessing or using our website, you agree to be bound by these Terms of Service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">2. Use of Service</h2>
                        <p>You may use our service to create legitimate documents and designs. You agree not to use this service for any illegal or unauthorized purpose.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">3. User Content</h2>
                        <p>You retain ownership of any content you upload. By uploading content, you grant us a license to use, store, and display that content specifically for the purpose of providing the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">4. Disclaimer</h2>
                        <p>The service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
