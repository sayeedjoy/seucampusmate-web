export default function StatsSection() {
    return (
        <section className="pt-6 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8">
            <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 md:space-y-12 lg:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap">CampusMate in numbers</h2>
                    <p className="text-base leading-relaxed text-muted-foreground">CampusMate is a platform that helps students at Southeast University to manage their academic life.</p>
                </div>

                <div className="grid gap-8 divide-y-0 *:text-center md:grid-cols-3 md:gap-2 md:divide-x">
                    <div className="rounded-xl border border-border bg-muted/30 py-5 px-4 md:rounded-none md:border-0 md:bg-transparent md:py-0 md:px-0 space-y-4">
                        <div className="text-4xl md:text-5xl font-bold">10K+</div>
                        <p className="text-sm md:text-base text-muted-foreground">Downloads on Google Play</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 py-5 px-4 md:rounded-none md:border-0 md:bg-transparent md:py-0 md:px-0 space-y-4">
                        <div className="text-4xl md:text-5xl font-bold">7K+</div>
                        <p className="text-sm md:text-base text-muted-foreground">Active Users</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 py-5 px-4 md:rounded-none md:border-0 md:bg-transparent md:py-0 md:px-0 space-y-4">
                        <div className="text-4xl md:text-5xl font-bold">15+</div>
                        <p className="text-sm md:text-base text-muted-foreground">Tools</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
