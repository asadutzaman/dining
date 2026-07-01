import React from "react";
import { Switch, Tag } from "antd";

export default class CommonUtils {
    public getStatusNameByLevel = (status: any = 0) => {
        if (status === true) {
            return <Tag color="success">Active</Tag>;
        }
        if (status === 1) {
            return <Tag color="success">Active</Tag>;
        } else if (status === false) {
            return <Tag color="default">Inactive</Tag>;
        } else if (status === 0) {
            return <Tag color="default">Inactive</Tag>;
        }
    };

    public getPublishStatusNameByLevel = (status: any = 0) => {
        if (status === 0) {
            return <Tag color="default">Unpublish</Tag>;
        }
        if (status === 1) {
            return <Tag color="warning">Upcoming</Tag>;
        } else if (status === 2) {
            return <Tag color="success">Publish</Tag>;
        }
    };

    public displaySwitchToggleBtn = (entity: any, status: any, callback: (checked: any, entity: any) => void) => {
        if (status) {
            return <Switch size="small" checked={true} onChange={(checked) => callback(checked, entity)} />;
        } else {
            return <Switch size="small" checked={false} onChange={(checked) => callback(checked, entity)} />;
        }
    };

    public ToLocalNumber(englishNumber: string | Number, isBangla: Boolean = true) {
        var bn: string[] = new Array("০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯");
        var en: string[] = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");

        if (englishNumber == null) return null;
        let chash = englishNumber.toString();
        let chashNew = "";
        if (isBangla) {
            var numArray = chash.split("");
            numArray.forEach(function (value) {
                for (var i = 0; i < 10; i++)
                    if (Number(value) == i) {
                        chashNew = chashNew + value.replace(en[i], bn[i]);
                    }
            });
            return chashNew;
        } else return chashNew == "" ? chash : (chashNew as any);
    }

    public ToLocalDate(englishdate: string, isBangla: Boolean = true, dateDivider: string = "-") {
        if (englishdate == null) return null;
        let chash = englishdate.toString();

        if (isBangla) {
            var Splitchash: string[] = chash.split(dateDivider);
            for (var i = 0; i < Splitchash.length; i++) chash = chash.replace(Splitchash[i], this.ToLocalNumber(Splitchash[i], isBangla));
            return chash;
        } else return chash;
    }

    public getYesNoLevelByFieldValue = (status: any = 0) => {
        if (status === true) {
            return <Tag color="success">Yes</Tag>;
        }
        if (status === 1) {
            return <Tag color="success">Yes</Tag>;
        } else if (status === false) {
            return <Tag color="default">No</Tag>;
        } else if (status === 0) {
            return <Tag color="default">No</Tag>;
        }
    };
}
