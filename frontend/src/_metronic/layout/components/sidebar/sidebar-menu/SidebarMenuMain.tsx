/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from 'react';
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub';
import { SidebarMenuItem } from './SidebarMenuItem';
import { LeftSidebarMenu } from './LeftSidebar.menu';
import { usePermissionContext } from '../../../../../app/hooks/context/usePermissionContext';
import { ObjectUtils } from '../../../../../app/utils';
import { useLang } from 'src/app/hooks/useLang';

const SidebarMenuMain = () => {
  const { isPermissionLoaded, hasPermission } = usePermissionContext();
  const [navigationList, setNavigationList] = useState<any>([]);
  const { t } = useLang();

  useEffect(() => {
    let leftSideMenuList = ObjectUtils.objectClone(LeftSidebarMenu);
    if (isPermissionLoaded) {
      leftSideMenuList = leftSideMenuList.filter((item: any) => {
        if (item.children) {
          // OLDER CODE 1 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD)
          //  return (item.children = item.children.filter((childItem: any) => {
          // NEWER CODE 1 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD - SUB CHILDS' SUB CHILD)
          item.children = item.children.filter((childItem: any) => {
            if (childItem.subParent === true) {
              // OLDER CODE 2 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD)
              //  return (childItem.subChildren = childItem.subChildren.filter(
              //   (subChildItem: any) => hasPermission(subChildItem.permission)
              // ));
              // NEWER CODE 2 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD - SUB CHILDS' SUB CHILD) [Starts]
              childItem.subChildren =
                childItem.subChildren
                  .map((subChildItem: any) => {
                    if (
                      subChildItem.subChildren &&
                      subChildItem.subChildren.length > 0
                    ) {
                      const filteredNested = subChildItem.subChildren.filter(
                        (nestedItem: any) => hasPermission(nestedItem.permission)
                      );

                      if (!filteredNested.length) {
                        return null;
                      }

                      return {
                        ...subChildItem,
                        subChildren: filteredNested,
                      };
                    }

                    if (!hasPermission(subChildItem.permission)) {
                      return null;
                    }

                    return subChildItem;
                  })
                  .filter((subChildItem: any) => subChildItem !== null) || [];

              return childItem.subChildren.length > 0;
              // NEWER CODE 2 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD - SUB CHILDS' SUB CHILD) [ENDS]
            } else {
              return hasPermission(childItem.permission);
            }
          //  OLDER CODE 3 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD)
          //  }));

          // NEWER CODE 3 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD - SUB CHILDS' SUB CHILD) [Starts]
          });

          return item.children.length > 0;
          // NEWER CODE 3 (PERMISSION WAS FOR PARENT - CHILD - SUB CHILD - SUB CHILDS' SUB CHILD) [ENDS]
        }
      });

      setNavigationList(leftSideMenuList);
    }
  }, [isPermissionLoaded]);

  return (
    <>
      {navigationList.map((item: any, index: number) => {
        return (
          <>
            {item.children.length > 0 && (
              <>
                {!item.hidden && (
                  <div className="menu-item">
                    <div className="menu-content pt-2 pb-2">
                      <span className="menu-section text-muted text-uppercase fs-8 ls-1">
                        {t(item.title)}
                      </span>
                    </div>
                  </div>
                )}

                {item.children.map((childItem: any, childIndex: number) => {
                  return (
                    <>
                      {childItem.subChildren.length > 0 && (
                        <SidebarMenuItemWithSub
                          key={childIndex}
                          to={childItem.link.to}
                          title={childItem.title}
                          fontIcon="bi-chat-left"
                          icon={childItem.icon}
                        >
                          {childItem.subChildren.map(
                            // PREVIOUS CODE
                            //     (subChildItem: any, subChildIndex: number) => (
                            //   <SidebarMenuItem
                            //     key={subChildIndex}
                            //     to={subChildItem.link.to}
                            //     title={subChildItem.title}
                            //     hasBullet={true}
                            //   />
                            // )
                            // NEW CODE TO SUPPORT SUB CHILDREN INSIDE SUB CHILDREN
                            (subChildItem: any, subChildIndex: number) => {
                              if (
                                subChildItem.subChildren &&
                                subChildItem.subChildren.length > 0
                              ) {
                                return (
                                  <SidebarMenuItemWithSub
                                    key={subChildIndex}
                                    to={subChildItem.link.to}
                                    title={subChildItem.title}
                                    fontIcon="bi-chat-left"
                                    hasBullet={true}
                                  >
                                    {subChildItem.subChildren.map(
                                      (nestedItem: any, nestedIndex: number) => (
                                        <SidebarMenuItem
                                          key={nestedIndex}
                                          to={nestedItem.link.to}
                                          title={nestedItem.title}
                                          hasBullet={true}
                                        />
                                      )
                                    )}
                                  </SidebarMenuItemWithSub>
                                );
                              }

                              return (
                                <SidebarMenuItem
                                  key={subChildIndex}
                                  to={subChildItem.link.to}
                                  title={subChildItem.title}
                                  hasBullet={true}
                                />
                              );
                            }
                            // NEW CODE ENDS
                          )}
                        </SidebarMenuItemWithSub>
                      )}

                      {childItem.subChildren.length == 0 &&
                        childItem.subParent === false && (
                          <SidebarMenuItem
                            key={childIndex}
                            to={childItem.link.to}
                            icon={childItem.icon}
                            fontIcon="bi-app-indicator"
                            title={childItem.title}
                          />
                        )}
                    </>
                  );
                })}
              </>
            )}
          </>
        );
      })}
    </>
  );
};

export { SidebarMenuMain };
