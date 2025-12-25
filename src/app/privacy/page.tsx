export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-bold mb-4 text-yellow-500">Privacy Policy</h1>
                <p className="text-gray-400 mb-8">Last Updated: December 25, 2025</p>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Tiny Little Royale! We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our game and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-white mb-3 mt-4">Account Information</h3>
                        <p className="mb-3">When you create an account or log in via third-party services, we collect:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Email address (if provided by the authentication service)</li>
                            <li>Display name or username</li>
                            <li>Profile picture (if provided by the authentication service)</li>
                            <li>User ID from third-party authentication providers (Google, LINE, Telegram)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mb-3 mt-4">Game Data</h3>
                        <p className="mb-3">When you play our game, we collect:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Gameplay statistics (scores, matches played, wins/losses)</li>
                            <li>In-game progress and achievements</li>
                            <li>Leaderboard rankings</li>
                            <li>Game session data and timestamps</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mb-3 mt-4">Technical Information</h3>
                        <p className="mb-3">We automatically collect certain technical information:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>IP address and device information</li>
                            <li>Browser type and version</li>
                            <li>Operating system</li>
                            <li>Game performance metrics</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                        <p className="mb-3">We use the collected information to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide, operate, and maintain our game services</li>
                            <li>Authenticate your account and prevent fraud</li>
                            <li>Display leaderboards and player statistics</li>
                            <li>Save your game progress and preferences</li>
                            <li>Improve game performance and user experience</li>
                            <li>Communicate with you about updates, events, and promotions</li>
                            <li>Analyze usage patterns and optimize our services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Authentication</h2>
                        <p>
                            We use third-party authentication services (Google, LINE, Telegram) to allow you to log in. When you use these services, they may collect and share certain information with us according to their own privacy policies. We recommend reviewing the privacy policies of these services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                            <li>Google Privacy Policy: https://policies.google.com/privacy</li>
                            <li>LINE Privacy Policy: https://line.me/en/terms/policy/</li>
                            <li>Telegram Privacy Policy: https://telegram.org/privacy</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking Technologies</h2>
                        <p>
                            We use cookies and similar tracking technologies to store your session information, preferences, and track your activity on our website. You can control cookies through your browser settings, but disabling them may affect your ability to use certain features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Data Sharing and Disclosure</h2>
                        <p className="mb-3">We do not sell your personal information. We may share your information in the following circumstances:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Service Providers:</strong> With third-party vendors who help us operate our services</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li><strong>Public Information:</strong> Leaderboard data and usernames are publicly visible</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Guest Accounts</h2>
                        <p>
                            Guest accounts allow you to play without registration. Limited data is collected for guest sessions, primarily for gameplay functionality. Guest data is temporary and may be deleted at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Data Security</h2>
                        <p>
                            We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete or anonymize your personal information within a reasonable timeframe, except where we are required to retain it for legal purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your personal information</li>
                            <li>Object to or restrict certain processing of your data</li>
                            <li>Withdraw consent where we rely on consent for processing</li>
                        </ul>
                        <p className="mt-3">
                            To exercise these rights, please contact us through our support channels.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
                        <p>
                            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from a child under 13, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">12. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our services, you consent to such transfers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">13. Analytics</h2>
                        <p>
                            We may use analytics services (such as Google Analytics) to help understand how users interact with our services. These services may use cookies and collect information about your usage patterns.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">14. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">15. Contact Us</h2>
                        <p>
                            If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our Discord community or support channels.
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t border-white/10">
                        <p className="text-sm text-gray-500 text-center">
                            By using Tiny Little Royale, you acknowledge that you have read and understood this Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
