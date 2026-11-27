'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ImagePlus, LocateFixed, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCustomer, getCustomerProviders, getUsers, updateCustomer } from '@/actions';
import { Input } from '@/components';
import { Button, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Customer } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import ProviderFormDrawer from '../../providers/_components/list/form-drawer';
import { TYPES } from './format';

export const CUSTOMER_FORM_ID = 'customer-form';

const MAX_IMAGE = 20 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ID_RE = /^(?:\d{10}|\d{12}|\d{13})$/;
const PHONE_RE = /^(0[35789])[0-9]{8}$/;
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const STALE = 5 * 60 * 1000;

interface Props {
  /** Có = sửa; không có = thêm mới */
  initial?: Customer;
  onDone: (customer: Customer) => void;
  onPendingChange: (pending: boolean) => void;
}

const num = (v: string) => (v.trim() === '' || isNaN(Number(v)) ? null : Number(v));

// Thêm hoặc sửa khách hàng. Dùng chung cho trang Khách hàng và form dự án (thêm nhanh).
export function CustomerForm({ initial, onDone, onPendingChange }: Props) {
  const { can, isWide } = useCan();
  const me = useAuthStore((s) => s.user);
  const canAssign = isWide('customer:create');

  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [identifyCode, setIdentifyCode] = useState(initial?.identifyCode ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [lat, setLat] = useState(initial?.latitude != null ? String(initial.latitude) : '');
  const [lng, setLng] = useState(initial?.longitude != null ? String(initial.longitude) : '');
  const [staffId, setStaffId] = useState(initial?.staffId ?? (canAssign ? '' : (me?.id ?? '')));
  const [type, setType] = useState(initial?.type ?? 'potential');
  const [providerId, setProviderId] = useState(initial?.providerId ? String(initial.providerId) : '');
  const [kept, setKept] = useState<{ id: number; path: string }[]>(
    (initial?.images ?? []).map((i) => ({ id: i.id, path: i.imagePath })).filter((i) => i.path),
  );
  const [removed, setRemoved] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [locating, setLocating] = useState(false);
  const [addingProvider, setAddingProvider] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const staff = useQuery({
    queryKey: ['users', 'customer-staff'],
    queryFn: () => getUsers({ limit: 1000, permission: 'customer:update' }),
    enabled: canAssign && can('user:read'),
    staleTime: STALE,
  });
  const providers = useQuery({
    queryKey: ['customer-providers', 'all'],
    queryFn: () => getCustomerProviders({ limit: 1000 }),
    enabled: can('customer_provider:read'),
    staleTime: STALE,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { name: name.trim(), phone: phone.trim() };
      if (identifyCode.trim()) payload.identifyCode = identifyCode.trim();
      if (email.trim()) payload.email = email.trim();
      if (address.trim()) payload.address = address.trim();
      if (num(lat) !== null) payload.latitude = num(lat);
      if (num(lng) !== null) payload.longitude = num(lng);
      if (staffId) payload.staffId = staffId;
      if (initial && type) payload.type = type;
      payload.providerId = providerId ? Number(providerId) : null;

      const form = new FormData();
      form.append('customer', JSON.stringify(payload));
      files.forEach((f) => form.append('images', f));
      if (initial && removed.length) form.append('deleted_image_ids', JSON.stringify(removed));
      return initial ? updateCustomer(initial.id, form) : createCustomer(form);
    },
    onSuccess: (customer) => {
      ['customers', 'customer'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(initial ? 'Cập nhật khách hàng thành công' : 'Thêm khách hàng thành công');
      onDone(customer);
    },
    onError: (e) => showErrorToast(e, initial ? 'Không thể cập nhật khách hàng' : 'Không thể thêm khách hàng'),
  });

  const locate = () => {
    if (!navigator.geolocation) return void toast.error('Trình duyệt không hỗ trợ định vị GPS');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === err.PERMISSION_DENIED ? 'Bạn đã từ chối quyền truy cập vị trí' : 'Không lấy được vị trí hiện tại');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const pickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const ok = picked.filter((f) => {
      if (!IMAGE_TYPES.includes(f.type)) toast.error(`"${f.name}" không hợp lệ: chỉ nhận ảnh JPG, PNG, WebP`);
      else if (f.size > MAX_IMAGE) toast.error(`"${f.name}" vượt quá 20MB`);
      else return true;
      return false;
    });
    setFiles((cur) => [...cur, ...ok]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Vui lòng nhập tên khách hàng';
    if (!phone.trim()) next.phone = 'Vui lòng nhập số điện thoại';
    else if (!PHONE_RE.test(phone.trim())) next.phone = 'Số điện thoại không đúng định dạng Việt Nam';
    if (identifyCode.trim() && !ID_RE.test(identifyCode.trim())) next.identifyCode = 'Mã định danh là MST (10 hoặc 13 số) hoặc CCCD (12 số)';
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = 'Email không đúng định dạng';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  const staffOptions = (staff.data?.items ?? []).map((u) => ({ value: u.id, label: u.fullName || u.username || u.email }));
  const providerOptions = (providers.data?.items ?? []).map((p) => ({ value: String(p.id), label: p.name, hint: p.code }));

  const images = [
    ...kept.map((i) => ({
      key: `old-${i.id}`,
      name: i.path.split('/').pop() || 'Ảnh',
      src: getFileUrl(i.path),
      remove: () => {
        setKept((k) => k.filter((x) => x.id !== i.id));
        setRemoved((r) => [...r, i.id]);
      },
    })),
    ...files.map((f, i) => ({ key: `new-${i}`, name: f.name, src: '', remove: () => setFiles((cur) => cur.filter((_, j) => j !== i)) })),
  ];

  return (
    <>
      <form id={CUSTOMER_FORM_ID} onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Tên khách hàng *"
          placeholder="Tên khách hàng hoặc công ty"
          fullWidth
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            touch('name');
          }}
        />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          <Input
            label="Số điện thoại *"
            type="tel"
            inputMode="tel"
            placeholder="0901234567"
            fullWidth
            value={phone}
            error={errors.phone}
            onChange={(e) => {
              setPhone(e.target.value);
              touch('phone');
            }}
          />
          <Input
            label="Mã định danh"
            inputMode="numeric"
            placeholder="MST hoặc CCCD"
            fullWidth
            value={identifyCode}
            error={errors.identifyCode}
            onChange={(e) => {
              setIdentifyCode(e.target.value);
              touch('identifyCode');
            }}
          />
        </div>
        <Input
          label="Email"
          type="email"
          inputMode="email"
          placeholder="ten@congty.vn"
          fullWidth
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            touch('email');
          }}
        />
        <Input label="Địa chỉ" placeholder="Số nhà, đường, quận, thành phố" fullWidth value={address} onChange={(e) => setAddress(e.target.value)} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Tọa độ GPS</span>
            <Button variant="outline" icon={<LocateFixed size={16} />} loading={locating} onClick={locate}>
              Lấy vị trí hiện tại
            </Button>
          </div>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
            <Input label="Vĩ độ" type="number" step="any" placeholder="21.028511" fullWidth value={lat} onChange={(e) => setLat(e.target.value)} />
            <Input label="Kinh độ" type="number" step="any" placeholder="105.854444" fullWidth value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
        </div>

        {canAssign && (
          <Select
            label="Nhân viên phụ trách"
            value={staffId}
            options={staffOptions}
            loading={staff.isLoading}
            placeholder="Chọn nhân viên"
            clearLabel="Chưa phân công"
            onChange={setStaffId}
          />
        )}
        {initial && <Select label="Phân loại" value={type} options={TYPES} onChange={setType} />}
        {can('customer_provider:read') && (
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Select
                label="Nhà cung cấp"
                value={providerId}
                options={providerOptions}
                loading={providers.isLoading}
                placeholder="Chọn nhà cung cấp"
                clearLabel="Không chọn"
                onChange={setProviderId}
              />
            </div>
            {can('customer_provider:create') && (
              <button
                type="button"
                aria-label="Thêm nhanh nhà cung cấp"
                title="Thêm nhanh nhà cung cấp"
                onClick={() => setAddingProvider(true)}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-control border border-slate-200 text-slate-600 transition active:scale-95 active:bg-slate-100 md:size-10 md:hover:bg-slate-50"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">Hình ảnh đính kèm</span>
          {images.map((img) => (
            <div key={img.key} className="flex min-h-11 items-center gap-2 rounded-control bg-slate-100 px-3 text-sm">
              {img.src ? (
                <img src={img.src} alt="" className="size-8 flex-none rounded-sm object-cover" />
              ) : (
                <ImagePlus size={16} className="flex-none text-slate-500" />
              )}
              <span className="min-w-0 flex-1 truncate">{img.name}</span>
              <button
                type="button"
                aria-label={`Bỏ ${img.name}`}
                onClick={img.remove}
                className="flex size-11 flex-none cursor-pointer items-center justify-center text-slate-500 md:size-9"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-dashed border-slate-300 px-3 text-sm text-slate-500 active:bg-slate-50 md:hover:bg-slate-50">
            <ImagePlus size={16} />
            Chọn ảnh (tối đa 20MB mỗi ảnh)
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickImages} />
          </label>
        </div>
      </form>

      <ProviderFormDrawer side isOpen={addingProvider} onClose={() => setAddingProvider(false)} onCreated={(p) => setProviderId(String(p.id))} />
    </>
  );
}
