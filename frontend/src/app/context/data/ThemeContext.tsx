import React, { createContext, useState } from 'react'

const initialState = {
    orgLogo: '',
    orgName: '',
    pageIcon: '',
    pageTitle: '',
    pageImage: '',
    pageContent: '',
    breadcrumb: { component: null },

    setOrgLogo: (value: any) => { },
    setOrgName: (value: string) => { },
    setPageIcon: (value: any) => { },
    setPageTitle: (value: string) => { },
    setPageImage: (value: any) => { },
    setPageContent: (value: any) => { },
    setBreadcrumb: (value: any) => { },
}

export const ThemeContext = createContext(initialState);

export const ThemeProvider = ({ children }: any) => {
    const [orgLogo, changeOrgLogo] = useState<any>(initialState.orgLogo);
    const [orgName, changeOrgName] = useState<string>(initialState.orgName);
    const [pageIcon, changePageIcon] = useState<any>(initialState.pageIcon);
    const [pageTitle, changePageTitle] = useState<string>(initialState.pageTitle);
    const [pageImage, changePageImage] = useState<any>(initialState.pageImage);
    const [pageContent, changePageContent] = useState<any>(initialState.pageContent);
    const [breadcrumb, changeBreadcrumb] = useState<any>(initialState.breadcrumb);

    const setOrgLogo = (value: any) => {
        changeOrgLogo(value);
    }

    const setOrgName = (value: any) => {
        changeOrgName(value);
    }

    const setPageIcon = (value: any) => {
        changePageIcon(value);
    }

    const setPageTitle = (value: any) => {
        changePageTitle(value);
    }

    const setPageImage = (value: any) => {
        changePageImage(value);
    }

    const setPageContent = (value: any) => {
        changePageContent(value);
    }

    const setBreadcrumb = (value: any) => {
        changeBreadcrumb(value);
    }

    const contextValue = {
        orgLogo,
        orgName,
        pageIcon,
        pageTitle,
        pageImage,
        pageContent,
        breadcrumb,

        setOrgLogo,
        setOrgName,
        setPageIcon,
        setPageTitle,
        setPageImage,
        setPageContent,
        setBreadcrumb
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
