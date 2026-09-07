- đối với công thức có các công thức dưới đây
{
    "items": [
        {
            "code": "KBPTCS",
            "name": "Khuôn bao phủ tường - cửa sổ",
            "unit": "md",
            "type": "wall_cladding",
            "doorType": "cs",
            "wastageRate": 0.0,
            "widthAdd": 0,
            "heightAdd": 0,
            "coefficientWidth": 2,
            "coefficientHeight": 2,
            "id": 7,
            "createdAt": "2026-08-15T08:42:54.119332Z",
            "updatedAt": "2026-08-15T08:42:54.119332Z"
        },
        {
            "code": "KBPT",
            "name": "Khuôn bao phủ tường",
            "unit": "md",
            "type": "wall_cladding",
            "doorType": "cd",
            "wastageRate": 0.0,
            "widthAdd": 0,
            "heightAdd": 0,
            "coefficientWidth": 1,
            "coefficientHeight": 2,
            "id": 6,
            "createdAt": "2026-08-15T08:40:15.623222Z",
            "updatedAt": "2026-08-15T08:40:15.623222Z"
        },
        {
            "code": "CDT01",
            "name": "Cả đường tròn",
            "unit": "md",
            "type": "circle",
            "doorType": null,
            "wastageRate": 1.07,
            "widthAdd": 0,
            "heightAdd": 0,
            "coefficientWidth": null,
            "coefficientHeight": null,
            "id": 5,
            "createdAt": "2026-08-13T11:36:22.460016Z",
            "updatedAt": "2026-08-14T09:14:54.430552Z"
        },
        {
            "code": "NDT01",
            "name": "Nửa đường tròn",
            "unit": "md",
            "type": "semicircle",
            "doorType": null,
            "wastageRate": 1.07,
            "widthAdd": 0,
            "heightAdd": 0,
            "coefficientWidth": null,
            "coefficientHeight": null,
            "id": 4,
            "createdAt": "2026-08-13T11:35:58.611723Z",
            "updatedAt": "2026-08-14T09:15:02.794823Z"
        },
        {
            "code": "PBT01",
            "name": "Phào biệt thự",
            "unit": "md",
            "type": "door_trim",
            "doorType": null,
            "wastageRate": 0.0,
            "widthAdd": 520,
            "heightAdd": 450,
            "coefficientWidth": null,
            "coefficientHeight": null,
            "id": 3,
            "createdAt": "2026-08-13T11:10:00.446870Z",
            "updatedAt": "2026-08-14T09:15:07.719090Z"
        }
    ],
    "meta": {
        "next": false,
        "total": 5,
        "offset": 0,
        "limit": 9999
    }
}

có lưu ý như sau
1. ở báo giá chỉ cho nhập chiều rộng cho công thức nửa đường tròn và cả dường tròn
2. những công thức còn lại đều đã được tính ở dưới backend