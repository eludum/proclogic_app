"use client"
import { siteConfig } from '@/app/siteConfig'
import { Publication } from '@/data/publicationSchema'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const PublicationPage = () => {
    const { workspace_id } = useParams()
    const [publication, setPublication] = useState<Publication | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (workspace_id) {
            const fetchPublication = async () => {
                try {
                    const response = await fetch(`${siteConfig.api_base_url}/publication/${workspace_id}`)
                    if (!response.ok) {
                        throw new Error('Network response was not ok')
                    }
                    const data: Publication = await response.json()
                    setPublication(data)
                } catch (error) {
                    if (error instanceof Error) {
                        setError(error.message)
                    } else {
                        setError('An unknown error occurred')
                    }
                } finally {
                    setLoading(false)
                }
            }

            fetchPublication()
        }
    }, [workspace_id])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!publication) {
        return <div>No publication found</div>
    }

    return (
        <div>
            <h1>{publication.title}</h1>
            {/* Add more fields as needed */}
        </div>
    )
}

export default PublicationPage