"use client";

import { useMemo, useState } from "react";
import { Modal, Button, Select, Input, Textarea } from "@/components";
import toast from "react-hot-toast";
import { createAdjustmentRequest, getUsers } from "@/actions";
import type {
  RequestType,
  AttendanceAdjustmentRequestCreate,
  Attendance,
  AdjustmentForm,
} from "@/types";
import { useAttendances, useAuthStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddAdjustmentModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = useMemo(
    () => currentUser?.roles?.some((r) => r.code?.toLowerCase() === "admin" || r.name?.toLowerCase() === "admin"),
    [currentUser]
  );

  const [form, setForm] = useState<AdjustmentForm>({
    userId: currentUser && !isAdmin ? currentUser.id : "",
    attendanceId: "",
    requestType: "check_in",
    workDate: "",
    oldCheckIn: "",
    oldCheckOut: "",
    requestedCheckIn: "",
    requestedCheckOut: "",
    reason: "",
  });

  useEffect(() => {
    if (open && currentUser && !isAdmin) {
      setForm((prev) => ({ ...prev, userId: currentUser.id }));
    }
  }, [open, currentUser, isAdmin]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // USERS
  // =========================================================

  const {
    data: usersList,
    isLoading: isLoadingUsers,
  } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => getUsers(),
  });

  const employees = useMemo(
    () => usersList?.items ?? [],
    [usersList]
  );

  // =========================================================
  // ATTENDANCES
  // =========================================================

  const {
    data: attendancesData,
    isLoading: isLoadingAttendances,
  } = useAttendances();

  const attendances: Attendance[] = useMemo(
    () => attendancesData?.items ?? [],
    [attendancesData]
  );

  // =========================================================
  // HELPERS
  // =========================================================

  /**
   * Convert:
   *
   * 18:00
   * 18:00:00
   * 2026-08-10T18:00:00
   *
   * thành:
   *
   * 18:00
   */
  const formatTime = (
    value?: string | null
  ): string => {
    if (!value) {
      return "";
    }

    if (value.includes("T")) {
      return value.substring(11, 16);
    }

    return value.substring(0, 5);
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setForm({
      userId: "",
      attendanceId: "",
      requestType: "both",
      workDate: "",
      oldCheckIn: "",
      oldCheckOut: "",
      requestedCheckIn: "",
      requestedCheckOut: "",
      reason: "",
    });
  };

  /**
   * Xử lý lỗi API
   */
  const handleCreateError = (err: any) => {
    console.error(
      "Create adjustment error:",
      err
    );

    const responseData = err?.response?.data;

    // FastAPI validation error
    if (Array.isArray(responseData?.detail)) {
      responseData.detail.forEach((item: any) => {
        toast.error(
          item?.msg ?? "Dữ liệu không hợp lệ"
        );
      });

      return;
    }

    // detail string
    if (
      typeof responseData?.detail === "string"
    ) {
      toast.error(responseData.detail);
      return;
    }

    // message
    if (
      typeof responseData?.message === "string"
    ) {
      toast.error(responseData.message);
      return;
    }

    // Axios network/server error
    if (err?.response?.status) {
      toast.error(
        `Lỗi server(${err.response.status})`
      );

      return;
    }

    toast.error("Không thể tạo khiếu nại");
  };

  // =========================================================
  // REQUEST TYPE
  // =========================================================

  /**
   * Quy ước:
   *
   * check_in
   * -> Attendance đã tồn tại
   * -> Điều chỉnh Check In
   *
   * check_out
   * -> Attendance đã tồn tại
   * -> Điều chỉnh Check Out
   *
   * both
   * -> Quên chấm công hoàn toàn
   * -> Không có Attendance
   * -> Không gửi attendanceId
   */

  const isMissingAttendance =
    form.requestType === "both" || form.requestType === "forgot_attendance";

  // =========================================================
  // FIND ATTENDANCE
  // =========================================================

  /**
   * Chỉ tìm attendance cho:
   *
   * check_in
   * check_out
   *
   * Với both:
   * -> Không tìm attendance
   * -> Vì both = quên chấm công hoàn toàn
   */
  const selectedAttendance = useMemo(() => {
    if (
      !form.userId ||
      !form.workDate
    ) {
      return undefined;
    }

    if (isMissingAttendance) {
      return undefined;
    }

    const result = attendances.find(
      (attendance) => {
        const attendanceUserId =
          attendance.userId ??
          attendance.user?.id;

        const attendanceDate =
          attendance.workDate;

        return (
          String(attendanceUserId) ===
          String(form.userId) &&
          String(attendanceDate).slice(0, 10) ===
          form.workDate
        );
      }
    );

    console.log(
      "SELECTED ATTENDANCE:",
      result
    );

    return result;
  }, [
    attendances,
    form.userId,
    form.workDate,
    form.requestType,
    isMissingAttendance,
  ]);

  // =========================================================
  // USER CHANGE
  // =========================================================

  const handleSelectUser = (
    userId: string
  ) => {
    setForm((prev) => ({
      ...prev,

      userId,

      // Reset attendance mapping
      attendanceId: "",

      // User đổi -> chọn ngày lại
      workDate: "",

      oldCheckIn: "",
      oldCheckOut: "",

      requestedCheckIn: "",
      requestedCheckOut: "",
    }));
  };

  // =========================================================
  // DATE CHANGE
  // =========================================================

  const handleSelectWorkDate = (
    date: string
  ) => {
    /**
     * BOTH = quên chấm công hoàn toàn
     *
     * Không tìm attendance.
     */
    if (form.requestType === "both") {
      setForm((prev) => ({
        ...prev,

        workDate: date,

        attendanceId: "",

        oldCheckIn: "",
        oldCheckOut: "",
      }));

      return;
    }

    /**
     * CHECK_IN / CHECK_OUT
     *
     * Tìm attendance theo:
     * userId + workDate
     */
    const attendance =
      attendances.find(
        (item) =>
          String(item.userId) ===
          String(form.userId) &&
          String(item.workDate).slice(0, 10) ===
          date
      );

    setForm((prev) => ({
      ...prev,

      workDate: date,

      attendanceId:
        attendance?.id != null
          ? String(attendance.id)
          : "",

      oldCheckIn:
        formatTime(
          attendance?.checkIn
        ),

      oldCheckOut:
        formatTime(
          attendance?.checkOut
        ),
    }));
  };

  // =========================================================
  // REQUEST TYPE CHANGE
  // =========================================================

  const handleChangeRequestType = (
    requestType: RequestType
  ) => {
    /**
     * BOTH
     *
     * = Quên chấm công hoàn toàn
     *
     * Không có attendanceId
     * Không có oldCheckIn
     * Không có oldCheckOut
     */
    if (requestType === "both") {
      setForm((prev) => ({
        ...prev,

        requestType,

        attendanceId: "",

        oldCheckIn: "",
        oldCheckOut: "",
      }));

      return;
    }

    /**
     * CHECK_IN / CHECK_OUT
     *
     * Tìm lại attendance nếu:
     * user + date đã được chọn.
     */
    let attendance:
      | Attendance
      | undefined;

    if (
      form.userId &&
      form.workDate
    ) {
      attendance =
        attendances.find(
          (item) =>
            String(item.userId) ===
            String(form.userId) &&
            String(item.workDate).slice(0, 10) ===
            form.workDate
        );
    }

    setForm((prev) => ({
      ...prev,

      requestType,

      attendanceId:
        attendance?.id != null
          ? String(attendance.id)
          : "",

      oldCheckIn:
        attendance
          ? formatTime(
            attendance.checkIn
          )
          : "",

      oldCheckOut:
        attendance
          ? formatTime(
            attendance.checkOut
          )
          : "",

      // Reset requested time khi đổi loại
      requestedCheckIn: "",
      requestedCheckOut: "",
    }));
  };

  // =========================================================
  // UPDATE FIELD
  // =========================================================

  const updateField = <
    K extends keyof AdjustmentForm
  >(
    field: K,
    value: AdjustmentForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (!form.userId) {
      toast.error(
        "Vui lòng chọn nhân viên"
      );
      return;
    }

    if (!form.workDate) {
      toast.error(
        "Vui lòng chọn ngày làm việc"
      );
      return;
    }

    if (!form.reason.trim()) {
      toast.error(
        "Vui lòng nhập lý do"
      );
      return;
    }

    // =======================================================
    // CASE 1
    // BOTH = QUÊN CHẤM CÔNG HOÀN TOÀN
    // =======================================================

    if (
      form.requestType === "both" || form.requestType === "forgot_attendance"
    ) {
      /**
       * Không có attendance.
       *
       * Không gửi attendanceId.
       *
       * requestedCheckIn / requestedCheckOut
       * là thời gian chấm công mới.
       */

      if (
        !form.requestedCheckIn &&
        !form.requestedCheckOut
      ) {
        toast.error(
          "Vui lòng nhập Check In hoặc Check Out yêu cầu"
        );

        return;
      }

      const payload: AttendanceAdjustmentRequestCreate =
      {
        attendanceId: undefined,

        userId:
          form.userId,

        requestType:
          form.requestType,

        workDate:
          form.workDate,

        oldCheckIn:
          undefined,

        oldCheckOut:
          undefined,

        requestedCheckIn:
          form.requestedCheckIn ||
          undefined,

        requestedCheckOut:
          form.requestedCheckOut ||
          undefined,

        reason:
          form.reason.trim(),

        status:
          "pending",
      };

      console.log(
        "CREATE MISSING ATTENDANCE REQUEST:",
        payload
      );

      setIsSubmitting(true);

      try {
        const res =
          await createAdjustmentRequest(
            payload
          );

        console.log(
          "CREATE MISSING RESPONSE:",
          res
        );

        toast.success(
          "Tạo khiếu nại thành công"
        );

        resetForm();

        onSuccess?.();
        onClose();
      } catch (err: any) {
        handleCreateError(err);
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    // =======================================================
    // CASE 2
    // CHECK_IN / CHECK_OUT
    // ATTENDANCE ĐÃ TỒN TẠI
    // =======================================================

    if (!selectedAttendance) {
      toast.error(
        "Không tìm thấy dữ liệu chấm công trong ngày này"
      );

      return;
    }

    if (
      selectedAttendance.id == null
    ) {
      toast.error(
        "Không xác định được mã chấm công"
      );

      return;
    }

    // -------------------------------------------------------
    // CHECK IN
    // -------------------------------------------------------

    if (
      form.requestType ===
      "check_in"
    ) {
      if (
        !form.requestedCheckIn
      ) {
        toast.error(
          "Vui lòng nhập Check In yêu cầu"
        );

        return;
      }
    }

    // -------------------------------------------------------
    // CHECK OUT
    // -------------------------------------------------------

    if (
      form.requestType ===
      "check_out"
    ) {
      if (
        !form.requestedCheckOut
      ) {
        toast.error(
          "Vui lòng nhập Check Out yêu cầu"
        );

        return;
      }
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload: AttendanceAdjustmentRequestCreate =
    {
      /**
       * Attendance đã tồn tại
       *
       * -> bắt buộc gửi ID
       */
      attendanceId:
        Number(
          selectedAttendance.id
        ),

      userId:
        form.userId,

      requestType:
        form.requestType,

      workDate:
        form.workDate,

      oldCheckIn:
        form.oldCheckIn ||
        undefined,

      oldCheckOut:
        form.oldCheckOut ||
        undefined,

      requestedCheckIn:
        form.requestType ===
          "check_in"
          ? form.requestedCheckIn ||
          undefined
          : undefined,

      requestedCheckOut:
        form.requestType ===
          "check_out"
          ? form.requestedCheckOut ||
          undefined
          : undefined,

      reason:
        form.reason.trim(),

      status:
        "pending",
    };

    console.log(
      "CREATE ATTENDANCE ADJUSTMENT:",
      payload
    );

    setIsSubmitting(true);

    try {
      const res =
        await createAdjustmentRequest(
          payload
        );

      console.log(
        "CREATE ADJUSTMENT RESPONSE:",
        res
      );

      toast.success(
        "Tạo khiếu nại thành công"
      );

      resetForm();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      handleCreateError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // UI CONDITIONS
  // =========================================================

  /**
   * BOTH = quên chấm công hoàn toàn
   */

  /**
   * Chỉ hiển thị Check In cũ
   * khi requestType = check_in
   */
  const showOldCheckIn =
    form.requestType ===
    "check_in";

  /**
   * Chỉ hiển thị Check Out cũ
   * khi requestType = check_out
   */
  const showOldCheckOut =
    form.requestType ===
    "check_out";

  /**
   * Check In yêu cầu:
   *
   * check_in -> Có
   * check_out -> Không
   * both -> Có
   */
  const showRequestedCheckIn =
    form.requestType === "check_in" ||
    form.requestType === "both" ||
    form.requestType === "forgot_attendance";

  const showRequestedCheckOut =
    form.requestType === "check_out" ||
    form.requestType === "both" ||
    form.requestType === "forgot_attendance";

  // =========================================================
  // OPTIONS
  // =========================================================

  const employeeOptions = [
    {
      value: "",
      label:
        "-- Chọn nhân viên --",
    },

    ...employees.map(
      (user) => ({
        value:
          user?.id ?? "",

        label:
          user?.fullName ??
          "Không tên",
      })
    ),
  ];

  /**
   * RequestType:
   *
   * check_in
   * check_out
   * both = quên chấm công
   */
  const requestTypeOptions = [
    {
      value: "check_in",
      label: "Điều chỉnh Check In",
    },
    {
      value: "check_out",
      label: "Điều chỉnh Check Out",
    },
    {
      value: "forgot_attendance",
      label: "Quên điểm danh",
    },
  ];

  // =========================================================
  // FOOTER
  // =========================================================

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={
          isSubmitting
        }
      >
        Hủy
      </Button>

      <Button
        onClick={
          handleSubmit
        }
        disabled={
          isSubmitting
        }
      >
        {isSubmitting
          ? "Đang lưu..."
          : "Tạo khiếu nại"}
      </Button>
    </div>
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Thêm khiếu nại"
      size="lg"
      footer={footer}
    >
      <div className="space-y-4 py-2">

        <p className="text-xs text-slate-500 mb-2">
          Tạo yêu cầu điều chỉnh chấm công mới
        </p>

        {/* =================================================
            USER + DATE
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Select
            label="Nhân viên *"
            options={
              employeeOptions
            }
            value={
              form.userId
            }
            onChange={(
              e
            ) =>
              handleSelectUser(
                e.target.value
              )
            }
            disabled={
              isLoadingUsers || !isAdmin
            }
            fullWidth
          />

          <Input
            label="Ngày làm việc *"
            value={
              form.workDate
            }
            onChange={(
              e
            ) =>
              handleSelectWorkDate(
                e.target.value
              )
            }
            fullWidth
            type="date"
          />

        </div>

        {/* =================================================
            REQUEST TYPE
        ================================================= */}

        <Select
          label="Loại khiếu nại *"
          options={
            requestTypeOptions
          }
          value={
            form.requestType
          }
          onChange={(
            e
          ) =>
            handleChangeRequestType(
              e.target
                .value as RequestType
            )
          }
          fullWidth
        />

        {/* =================================================
            ATTENDANCE STATUS
        ================================================= */}

        {form.userId &&
          form.workDate &&
          !isMissingAttendance && (
            <div className="text-xs">

              {isLoadingAttendances ? (
                <p className="text-slate-500">
                  Đang tìm dữ liệu chấm công...
                </p>
              ) : selectedAttendance ? (
                <p className="text-green-600">
                  Đã tìm thấy dữ liệu chấm công.
                </p>
              ) : (
                <p className="text-red-500">
                  Không có dữ liệu chấm công
                  trong ngày này.
                  Nếu nhân viên quên chấm công
                  hoàn toàn, hãy chọn
                  <strong>
                    {" "}
                    "Quên chấm công"
                  </strong>
                  .
                </p>
              )}

            </div>
          )}

        {/* =================================================
            OLD CHECK IN
        ================================================= */}

        {showOldCheckIn && (
          <Input
            label="Check In cũ"
            type="time"
            value={
              form.oldCheckIn
            }
            onChange={(
              e
            ) =>
              updateField(
                "oldCheckIn",
                e.target.value
              )
            }
            fullWidth
          />
        )}

        {/* =================================================
            OLD CHECK OUT
        ================================================= */}

        {showOldCheckOut && (
          <Input
            label="Check Out cũ"
            type="time"
            value={
              form.oldCheckOut
            }
            onChange={(
              e
            ) =>
              updateField(
                "oldCheckOut",
                e.target.value
              )
            }
            fullWidth
          />
        )}

        {/* =================================================
            REQUESTED CHECK IN
        ================================================= */}

        {showRequestedCheckIn && (
          <Input
            label="Check In yêu cầu *"
            type="time"
            value={
              form.requestedCheckIn
            }
            onChange={(
              e
            ) =>
              updateField(
                "requestedCheckIn",
                e.target.value
              )
            }
            fullWidth
          />
        )}

        {/* =================================================
            REQUESTED CHECK OUT
        ================================================= */}

        {showRequestedCheckOut && (
          <Input
            label="Check Out yêu cầu *"
            type="time"
            value={
              form.requestedCheckOut
            }
            onChange={(
              e
            ) =>
              updateField(
                "requestedCheckOut",
                e.target.value
              )
            }
            fullWidth
          />
        )}

        {/* =================================================
            REASON
        ================================================= */}

        <Textarea
          label="Lý do khiếu nại *"
          placeholder="Nhập lý do khiếu nại..."
          value={
            form.reason
          }
          onChange={(
            e
          ) =>
            updateField(
              "reason",
              e.target.value
            )
          }
          rows={3}
          fullWidth
        />

        {/* =================================================
            BOTH = MISSING ATTENDANCE INFO
        ================================================= */}

        {isMissingAttendance && (
          <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
            Không tìm kiếm bản ghi chấm công.
            Yêu cầu này được tạo mới và
            không tham chiếu đến attendance
            hiện có.
          </div>
        )}

      </div>
    </Modal>
  );
}
