// app/routes/index.tsx
import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { format } from "date-fns";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "../utils";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "../card";

const getData = createServerFn({ method: "GET" }).handler(() =>
    fetch(
        "https://scoupy.com/api/wsProxy/receipt-based-cashback/api/v10/coupon/list?type=woolsocks&pagination=no"
    )
        .then((res) => res.json())
        .then((d) => d.list)
);

export const Route = createFileRoute("/")({
    component: Home,
    loader: async () => await getData(),
});

type Coupon = {
    id_coupon: number;
    title: string;
    subtitle: string;
    coupon_startdate: string;
    coupon_enddate: string;
    image: string;
    coupon_max: number;
    coupon_per_person: number;
    uses_fallback_content: string;
    available_clients: {
        id_client: number;
    }[];
};

const CouponCardList = ({ data }: { data: Coupon[] }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd MMM yyyy");
    };

    const [lastVisit, setLastVisit] = useState<Date | null>(null);

    const [filterAH, _setFilterAH] = useState(false);
    function setFilterAH(value: boolean) {
        localStorage.setItem("filterAH", value.toString());
        _setFilterAH(value);
    }

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        setFilterAH(localStorage.getItem("filterAH") === "true");
        setLastVisit(
            localStorage.getItem("lastVisit")
                ? new Date(localStorage.getItem("lastVisit")!)
                : null
        );

        localStorage.setItem("lastVisit", new Date().toISOString());
    }, []);

    return (
        <>
            <div className="p-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={filterAH}
                        onChange={(e) => setFilterAH(e.target.checked)}
                    />
                    <span>Filter AH</span>
                </label>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {data
                    .filter((c) =>
                        filterAH
                            ? (c.available_clients ?? []).some(
                                  (c) => c.id_client === 4023
                              )
                            : true
                    )
                    .toSorted((a, b) =>
                        b.coupon_startdate.localeCompare(a.coupon_startdate)
                    )
                    .map((coupon) => {
                        const isExpired =
                            coupon.uses_fallback_content === "yes";
                        const status =
                            0 === coupon.coupon_per_person
                                ? "used"
                                : 0 === coupon.coupon_max
                                  ? "out_of_stock"
                                  : isExpired
                                    ? "expired"
                                    : "active";

                        const newCoupon =
                            lastVisit &&
                            new Date(coupon.coupon_startdate) > lastVisit;

                        if (status !== "active") {
                            return null;
                        }

                        return (
                            <Card
                                key={coupon.id_coupon}
                                className={cn(
                                    "overflow-hidden hover:shadow-lg transition-shadow flex flex-row",
                                    newCoupon && "border border-green-500"
                                )}
                            >
                                <div className="relative h-48 w-48 overflow-hidden flex-shrink-0">
                                    <img
                                        src={`https://assets.scoupy.nl/464/${coupon.image}`}
                                        alt={coupon.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div>
                                    <CardHeader className="p-4">
                                        <CardTitle>{coupon.title}</CardTitle>
                                        <CardDescription>
                                            {coupon.subtitle}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="text-sm text-gray-400 space-y-1">
                                            <p>
                                                Start:{" "}
                                                {formatDate(
                                                    coupon.coupon_startdate
                                                )}
                                            </p>
                                            <p>
                                                End:{" "}
                                                {formatDate(
                                                    coupon.coupon_enddate
                                                )}
                                            </p>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        );
                    })}
            </div>
        </>
    );
};

function Home() {
    const state = Route.useLoaderData();
    console.log(state);

    return (
        <div>
            <CouponCardList data={state} />
        </div>
    );
}
