export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <p className="text-slate-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create a template, upload images, or contact us. This may include your name, email address, and any content you upload.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, such as generating certificates and ID cards. We do not sell your personal data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">3. Data Storage</h2>
                        <p>Your templates and uploaded images are stored securely. We use local storage on your device for draft saving purposes to improve your experience.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-900">4. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
