/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
import Giscus from '@giscus/react';
import {Suspense} from 'react';
import * as React from 'react';
import {useRouter} from 'next/router';
import {SidebarNav} from './SidebarNav';
import {Footer} from './Footer';
import {Toc} from './Toc';
import SocialBanner from '../SocialBanner';
import {DocsPageFooter} from 'components/DocsFooter';
import {Seo} from 'components/Seo';
import PageHeading from 'components/PageHeading';
import {getRouteMeta} from './getRouteMeta';
import {TocContext} from '../MDX/TocContext';
import type {TocItem} from 'components/MDX/TocContext';
import type {RouteItem} from 'components/Layout/getRouteMeta';
import {HomeContent} from './HomeContent';
import {TopNav} from './TopNav';
import cn from 'classnames';
import {useTheme} from 'jotai/theme';

import(/* webpackPrefetch: true */ '../MDX/CodeBlock/CodeBlock');

interface PageProps {
  children: React.ReactNode;
  toc: Array<TocItem>;
  routeTree: RouteItem;
  meta: {
    title?: string;
    description?: string;
    translatedTitle?: string;
    translators?: string[];
    showToc?: boolean;
    showSurvey?: boolean;
    titleForTitleTag?: string;
    canary?: boolean;
  };
  section:
    | 'learn'
    | 'reference'
    | 'translators' /* | 'community' | 'blog' */
    | 'home'
    | 'unknown';
}

export function Page({children, toc, routeTree, meta, section}: PageProps) {
  const {asPath} = useRouter();
  const theme = useTheme();

  const cleanedPath = asPath.split(/[\?\#]/)[0];
  const {route, nextRoute, prevRoute, breadcrumbs, order} = getRouteMeta(
    cleanedPath,
    routeTree
  );
  const title = meta.title || route?.title || '';
  const translatedTitle = meta.translatedTitle || undefined;
  const translators = meta.translators || undefined;
  const canary = meta.canary || false;
  const description = meta.description || route?.description || '';
  const isHomePage = cleanedPath === '/';
  const isBlogIndex = cleanedPath === '/blog';
  const isMainArticle =
    cleanedPath.startsWith('/learn') || cleanedPath.startsWith('/reference');

  let content;
  if (isHomePage) {
    content = <HomeContent />;
  } else {
    content = (
      <div className="ps-0">
        <div
          className={cn(
            section === 'translators' && 'mx-auto px-0 lg:px-4 max-w-5xl'
          )}>
          <PageHeading
            title={title}
            translatedTitle={translatedTitle}
            translators={translators}
            canary={canary}
            description={description}
            tags={route?.tags}
            breadcrumbs={breadcrumbs}
          />
        </div>
        <div className="px-5 sm:px-12">
          <div
            className={cn(
              'max-w-7xl mx-auto',
              section === 'translators' && 'lg:flex lg:flex-col lg:items-center'
            )}>
            <TocContext.Provider value={toc}>{children}</TocContext.Provider>
          </div>
          {!isBlogIndex && (
            <DocsPageFooter
              route={route}
              nextRoute={nextRoute}
              prevRoute={prevRoute}
            />
          )}
        </div>
      </div>
    );
  }

  let hasColumns = true;
  let showSidebar = true;
  let showToc = meta.showToc ?? true;
  // let showSurvey = meta.showSurvey ?? true;
  if (isHomePage || isBlogIndex) {
    hasColumns = false;
    showSidebar = false;
    showToc = false;
    // showSurvey = false;
  } else if (section === 'translators') {
    showToc = false;
    hasColumns = false;
    showSidebar = false;
  } /*  else if (section === 'blog') {
    showToc = false;
    hasColumns = false;
    showSidebar = false;
  } */

  let searchOrder;
  if (section === 'learn' /*  || (section === 'blog' && !isBlogIndex) */) {
    searchOrder = order;
  }

  return (
    <>
      <Seo
        title={translatedTitle || title}
        titleForTitleTag={meta.titleForTitleTag}
        isHomePage={isHomePage}
        image={`/images/og-` + section + '.png'}
        searchOrder={searchOrder}
      />
      <SocialBanner />
      <TopNav
        section={section}
        routeTree={routeTree}
        breadcrumbs={breadcrumbs}
      />
      <div
        className={cn(
          hasColumns &&
            'grid grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc'
        )}>
        {showSidebar && (
          <div className="lg:-mt-16 z-10">
            <div className="fixed top-0 py-0 shadow lg:pt-16 lg:sticky start-0 end-0 lg:shadow-none">
              <SidebarNav
                key={section}
                routeTree={routeTree}
                breadcrumbs={breadcrumbs}
              />
            </div>
          </div>
        )}
        {/* No fallback UI so need to be careful not to suspend directly inside. */}
        <Suspense fallback={null}>
          <main className="min-w-0 isolate">
            <article
              className="font-normal break-words text-primary dark:text-primary-dark"
              key={asPath}>
              {content}

              {isMainArticle && (
                <div className="mx-auto w-full px-5 sm:px-12 md:px-12 pt-10">
                  <Giscus
                    repo="roy-jung/react.dev.ko"
                    repoId="R_kgDOJP6DbQ"
                    category="Announcements"
                    categoryId="DIC_kwDOJP6Dbc4CWGHq"
                    mapping="pathname"
                    strict="1"
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="top"
                    theme={theme}
                    lang="ko"
                    loading="lazy"
                  />
                </div>
              )}
            </article>

            <div
              className={cn(
                'self-stretch w-full',
                isHomePage && 'bg-wash dark:bg-gray-95 mt-[-1px]'
              )}>
              {!isHomePage && (
                <div className="w-full px-5 pt-10 mx-auto sm:px-12 md:px-12 md:pt-12 lg:pt-10">
                  <hr className="mx-auto max-w-7xl border-border dark:border-border-dark" />
                  {/* showSurvey && (
                      <>
                        <div className="flex flex-col items-center m-4 p-4">
                          <p className="font-bold text-primary dark:text-primary-dark text-lg mb-4">
                            How do you like these docs?
                          </p>
                          <div>
                            <ButtonLink
                              href="https://www.surveymonkey.co.uk/r/PYRPF3X"
                              className="mt-1"
                              type="primary"
                              size="md"
                              target="_blank">
                              Take our survey!
                              <IconNavArrow
                                displayDirection="right"
                                className="inline ml-1"
                              />
                            </ButtonLink>
                          </div>
                        </div>
                        <hr className="max-w-7xl mx-auto border-border dark:border-border-dark" />
                      </>
                    ) */}
                </div>
              )}
              <div
                className={cn(
                  'py-12 px-5 sm:px-12 md:px-12 sm:py-12 md:py-16 lg:py-14',
                  isHomePage && 'lg:pt-0'
                )}>
                <Footer />
              </div>
            </div>
          </main>
        </Suspense>
        <div className="hidden -mt-16 lg:max-w-custom-xs 2xl:block">
          {showToc && toc.length > 0 && <Toc headings={toc} key={asPath} />}
        </div>
      </div>
    </>
  );
}
