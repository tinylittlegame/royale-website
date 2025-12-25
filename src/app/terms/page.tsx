export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-bold mb-4 text-yellow-500">Terms of Service</h1>
                <p className="text-gray-400 mb-8">Last Updated: December 25, 2025</p>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            Welcome to Tiny Little Royale! By accessing or using our game, website, and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Account Registration</h2>
                        <p className="mb-3">When you create an account with us, you agree to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized access</li>
                        </ul>
                        <p className="mt-3">
                            You may log in using third-party services (Google, LINE, Telegram). You are responsible for maintaining the security of those accounts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Guest Accounts</h2>
                        <p>
                            Guest accounts are temporary and allow you to play without registration. Progress and statistics from guest sessions may not be saved. We are not responsible for any loss of guest account data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct</h2>
                        <p className="mb-3">You agree NOT to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Use cheats, exploits, automation software, bots, hacks, or mods</li>
                            <li>Engage in harassment, bullying, or toxic behavior</li>
                            <li>Share inappropriate, offensive, or illegal content</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the game servers or services</li>
                            <li>Sell, trade, or transfer your account to others</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality of Tiny Little Royale, including but not limited to graphics, logos, game mechanics, and software, are owned by us and protected by copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. In-Game Purchases</h2>
                        <p>
                            If we offer in-game purchases or virtual items, all sales are final. We reserve the right to modify pricing and availability at any time. Virtual items have no real-world value and cannot be exchanged for cash.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Game Modifications</h2>
                        <p>
                            We reserve the right to modify, suspend, or discontinue any aspect of the game at any time without prior notice. We may also update these Terms of Service, and your continued use constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that violates these terms or is harmful to other users or our business interests.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers</h2>
                        <p>
                            Tiny Little Royale is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. We are not liable for any loss of data, progress, or account information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Age Requirement</h2>
                        <p>
                            You must be at least 13 years old to use Tiny Little Royale. If you are under 18, you must have parental consent to use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
                        <p>
                            If you have questions about these Terms of Service, please contact us through our Discord community or support channels.
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t border-white/10">
                        <p className="text-sm text-gray-500 text-center">
                            By using Tiny Little Royale, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
