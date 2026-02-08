export default function StatsSection() {
    return (
        <section className="pt-8 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8">
            <div className="mx-auto max-w-5xl space-y-6 px-6 md:space-y-12 lg:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">CampusMate in numbers</h2>
                    <p>CampusMate is a platform that helps students at Southeast University to manage their academic life.</p>
                </div>

                <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
                    <div className="space-y-4">
                        <div className="text-4xl md:text-5xl font-bold">10K+</div>
                        <p>Downloads on Google Play</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-4xl md:text-5xl font-bold">7K+</div>
                        <p>Active Users</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-4xl md:text-5xl font-bold">15+</div>
                        <p>Tools</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
