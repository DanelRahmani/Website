import { ExternalLink } from '../components/ExternalLink';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';
import { XIcon } from '../components/icons/XIcon';
import { LinkedInIcon } from '../components/icons/LinkedInIcon';
import MyWebsite from '../images/logos/mywebsite.png';
import ServerLogo from '../images/logos/server.png';
import RahmaniLogo from '../images/logos/rahmani.svg';
import { manual } from 'prismjs';

export const Name = 'Danel Rahmani';

export const About = (
  <>
    {` This is my personal website, featuring my resume, my thoughts, and projects I've worked on.
    If you want to get in touch`}{' '}
    <ExternalLink href="mailto:danelrahmani@outlook.com">send me an email.</ExternalLink>
  </>
);
export const AboutExtended = `I am a student at the University of Groningen, and have a great many interests.`;

export type Project = {
  title: string;
  techStack: string[];
  description: string;
  logo: any;
  link?: {
    label: string;
    href: string;
  };
};

export const MyCurrentProjects: Project[] = [
  {
    title: 'My personal website',
    techStack: ['NodeJS', 'React', 'TypeScript','Notion','DNS management'],
    description: 'My personal website on the internet.',
    logo: MyWebsite,
    link: {
      label: 'github.com',
      href: 'https://github.com/DanelRahmani/website/',
    },
  },
];

export const MyPastProjects: Project[] = [
  {
    title: 'Personal Minecraft Server',
    techStack: ['Docker', 'Bash', 'Network Administration', 'Linux'],
    description: 'Past Project',
    logo: ServerLogo,
//    link: {
//      label: 'No Longer Available',
//      href: '-',
//    },
  },
];

export const SocialMedia = [
  { name: 'Twitter', link: 'https://twitter.com/DanelRahmani', icon: XIcon },
  { name: 'Instagram', link: 'https://www.instagram.com/danelrahmani/', icon: InstagramIcon },
  { name: 'Github', link: 'https://github.com/danelrahmani', icon: GitHubIcon },
  { name: 'LinkedIn', link: 'https://www.linkedin.com/in/danelrahmani', icon: LinkedInIcon },
] as const;

export const Work = [
  {
    company: 'Rahmani\'s Gordijn Kledingatelier',
    title: 'General Employee & Tailor',
    logo: RahmaniLogo,
    start: '2022',
    end: 'Present',
  },
] as const;

export const CompaniesLinks = [
  {
    name: 'Rahmani\'s Gordijn Kledingatelier',
    link: 'https://top-atelier.com/',
  },
] as const;

export const Books = [
  {
    name: 'The Kite Runner',
    link: 'https://www.goodreads.com/book/show/17165596-the-kite-runner/',
  },
] as const;

