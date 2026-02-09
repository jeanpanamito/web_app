export const metadata = {
    title: 'Auto Shutdown Control',
    description: 'Remote shutdown control application',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
