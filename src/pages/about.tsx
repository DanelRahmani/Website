import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import AvatarImage from '../../public/assets/blog/authors/danel.jpeg';
import { Container } from '../components/Container';
import { ExternalLink } from '../components/ExternalLink';
import { PageTitle } from '../components/PageTitle';
import { Section } from '../components/Section';
import { SocialLink } from '../components/SocialLink';
import {
  AboutExtended,
  Books,
  SocialMedia,
} from '../data/lifeApi';

const seoTitle = `About`;
const seoDescription = `A few words about me.`;

export default function AboutMe() {
  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${process.env.NEXT_PUBLIC_URL}/about`}
        openGraph={{
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_URL}/api/og?title=${seoTitle}&description=${seoDescription}`,
            },
          ],
        }}
      />
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={AvatarImage}
                alt=""
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="lg:order-first lg:row-span-2">
            <PageTitle>Hi, I am Danel Rahmani</PageTitle>
            <div className="mt-6 text-base">{AboutExtended}</div>
            <div className="mt-6 flex items-center gap-6">
            {SocialMedia.map((socialProfile) => (
              <SocialLink
                key={socialProfile.name}
                aria-label={`Follow on ${socialProfile.name}`}
                href={socialProfile.link}
                icon={socialProfile.icon}
              />
            ))}
            <a
              href="/assets/resume.pdf"
              download
              aria-label="Download resume"
              className="inline-flex items-center rounded-md px-3 py-1 text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition"
            >
              Resume
            </a>
          </div>
            <Section>
              <Section.Title as="h2">Work</Section.Title>
              <Section.Content>
                Hello, I’m Danel Rahmani, an International Business student with a strong interest in international business and finance. 
                I am currently focused on developing analytical and practical skills relevant to business and finance. 
                Welcome to my page, where I share my interests and projects.
                <br />
              </Section.Content>
            </Section>
            <Section>
              <Section.Title as="h2">Books I recommend</Section.Title>
              <Section.Content>
                <ul className="mt-1 list-disc list-inside">
                  {Books.map((book) => (
                    <li key={book.name}>
                      <ExternalLink href={book.link}>{book.name}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </Section.Content>
            </Section>
          </div>
        </div>
      </Container>
    </>
  );
}
