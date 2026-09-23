'use client';

/**
 * Ikon SVG inline (lucide) — pengganti Font Awesome.
 *
 * Dulu setiap halaman memuat 92 KB CSS + 268 KB file font Font Awesome hanya
 * untuk ~118 ikon. Sekarang tiap ikon adalah SVG kecil yang ikut ter-bundle
 * seperlunya, jadi ikon langsung tampil tanpa menunggu font.
 *
 * Pemakaian:
 *   <Icon fa="fa-solid fa-plus" />       // nama lama Font Awesome tetap jalan
 *   <Icon fa={item.icon} className="…" />
 */
import { createElement } from 'react';
import { ArrowDown, ArrowDownLeft, ArrowRightLeft, Banknote, Bell, Bike, BookUser, Building2, Calculator, CalendarCheck, CalendarDays, CalendarPlus, CalendarRange, CalendarX, Camera, ChartColumn, ChartLine, ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, CircleAlert, CircleArrowDown, CircleArrowUp, CircleCheck, CircleDot, CircleHelp, CircleX, Clock, CloudDownload, CloudUpload, Coins, Contrast, Copy, CreditCard, Crop, Crown, Database, Download, Ellipsis, EllipsisVertical, ExternalLink, Eye, FileSignature, FileSpreadsheet, FileText, Filter, Flag, Fuel, Globe, HandCoins, Headset, History, Hourglass, House, IdCard, Images, Info, Key, Landmark, LayoutGrid, Link, List, ListChecks, LoaderCircle, Lock, LogIn, LogOut, Mail, MapPin, MessageCircle, PaintRoller, Palette, Percent, Phone, PiggyBank, Plus, Printer, QrCode, Receipt, ReceiptText, RefreshCw, RotateCcw, RotateCw, Save, Scale, Search, Settings, Shapes, ShieldCheck, ShieldUser, SlidersHorizontal, SquarePen, Star, StickyNote, Store, Sun, Tag, Tags, Trash2, TrendingDown, TrendingUp, TriangleAlert, Truck, Upload, User, UserCheck, UserPen, UserPlus, UserRound, UserX, Users, Vault, Wallet, Wrench, X, Zap, ZoomIn } from 'lucide-react';

const MAP = {
  'motorcycle': 'Bike',
  'person-biking': 'Bike',
  'spinner': 'LoaderCircle',
  'circle-check': 'CircleCheck',
  'floppy-disk': 'Save',
  'plus': 'Plus',
  'whatsapp': 'MessageCircle',
  'pen-to-square': 'SquarePen',
  'magnifying-glass': 'Search',
  'magnifying-glass-plus': 'ZoomIn',
  'circle-exclamation': 'CircleAlert',
  'trash-can': 'Trash2',
  'trash': 'Trash2',
  'calendar-days': 'CalendarDays',
  'wrench': 'Wrench',
  'user': 'User',
  'crown': 'Crown',
  'triangle-exclamation': 'TriangleAlert',
  'xmark': 'X',
  'check': 'Check',
  'bell': 'Bell',
  'money-bill-wave': 'Banknote',
  'money-bill-transfer': 'ArrowRightLeft',
  'key': 'Key',
  'file-invoice': 'FileText',
  'file-excel': 'FileSpreadsheet',
  'file-invoice-dollar': 'ReceiptText',
  'file-signature': 'FileSignature',
  'clock': 'Clock',
  'clock-rotate-left': 'History',
  'circle-info': 'Info',
  'chevron-right': 'ChevronRight',
  'chevron-left': 'ChevronLeft',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'camera': 'Camera',
  'camera-retro': 'Camera',
  'wallet': 'Wallet',
  'users': 'Users',
  'users-slash': 'UserX',
  'rotate-left': 'RotateCcw',
  'rotate': 'RotateCw',
  'arrows-rotate': 'RefreshCw',
  'phone': 'Phone',
  'note-sticky': 'StickyNote',
  'id-card': 'IdCard',
  'flag-checkered': 'Flag',
  'credit-card': 'CreditCard',
  'calendar-plus': 'CalendarPlus',
  'calendar-check': 'CalendarCheck',
  'calendar-xmark': 'CalendarX',
  'calendar-week': 'CalendarRange',
  'calendar-day': 'CalendarDays',
  'vault': 'Vault',
  'user-tie': 'UserRound',
  'user-plus': 'UserPlus',
  'user-shield': 'ShieldUser',
  'user-pen': 'UserPen',
  'user-check': 'UserCheck',
  'sack-dollar': 'PiggyBank',
  'hand-holding-dollar': 'HandCoins',
  'coins': 'Coins',
  'receipt': 'Receipt',
  'palette': 'Palette',
  'paint-roller': 'PaintRoller',
  'location-dot': 'MapPin',
  'list': 'List',
  'list-check': 'ListChecks',
  'circle-arrow-up': 'CircleArrowUp',
  'circle-arrow-down': 'CircleArrowDown',
  'building-columns': 'Landmark',
  'building': 'Building2',
  'bolt': 'Zap',
  'tags': 'Tags',
  'tag': 'Tag',
  'sun': 'Sun',
  'sliders': 'SlidersHorizontal',
  'shield-halved': 'ShieldCheck',
  'screwdriver-wrench': 'Wrench',
  'lock': 'Lock',
  'grip': 'LayoutGrid',
  'globe': 'Globe',
  'gear': 'Settings',
  'circle-xmark': 'CircleX',
  'circle-question': 'CircleHelp',
  'circle-half-stroke': 'Contrast',
  'chart-pie': 'ChartPie',
  'chart-line': 'ChartLine',
  'chart-column': 'ChartColumn',
  'calculator': 'Calculator',
  'arrow-trend-down': 'TrendingDown',
  'arrow-trend-up': 'TrendingUp',
  'arrow-right-from-bracket': 'LogOut',
  'right-to-bracket': 'LogIn',
  'right-left': 'ArrowRightLeft',
  'arrow-down-left': 'ArrowDownLeft',
  'arrow-down': 'ArrowDown',
  'arrow-up-right-from-square': 'ExternalLink',
  'upload': 'Upload',
  'download': 'Download',
  'truck-ramp-box': 'Truck',
  'truck-arrow-right': 'Truck',
  'store': 'Store',
  'scale-balanced': 'Scale',
  'qrcode': 'QrCode',
  'print': 'Printer',
  'percent': 'Percent',
  'images': 'Images',
  'icons': 'Shapes',
  'hourglass-start': 'Hourglass',
  'headset': 'Headset',
  'gas-pump': 'Fuel',
  'filter': 'Filter',
  'eye': 'Eye',
  'database': 'Database',
  'crop-simple': 'Crop',
  'copy': 'Copy',
  'cloud-arrow-up': 'CloudUpload',
  'cloud-arrow-down': 'CloudDownload',
  'address-book': 'BookUser',
  'house': 'House',
  'ellipsis': 'Ellipsis',
  'ellipsis-vertical': 'EllipsisVertical',
  'grid': 'LayoutGrid',
  'circle-dot': 'CircleDot',
  'star': 'Star',
  'info': 'Info',
  'envelope': 'Mail',
  'link': 'Link'
};

const COMPONENTS = { ArrowDown, ArrowDownLeft, ArrowRightLeft, Banknote, Bell, Bike, BookUser, Building2, Calculator, CalendarCheck, CalendarDays, CalendarPlus, CalendarRange, CalendarX, Camera, ChartColumn, ChartLine, ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, CircleAlert, CircleArrowDown, CircleArrowUp, CircleCheck, CircleDot, CircleHelp, CircleX, Clock, CloudDownload, CloudUpload, Coins, Contrast, Copy, CreditCard, Crop, Crown, Database, Download, Ellipsis, EllipsisVertical, ExternalLink, Eye, FileSignature, FileSpreadsheet, FileText, Filter, Flag, Fuel, Globe, HandCoins, Headset, History, Hourglass, House, IdCard, Images, Info, Key, Landmark, LayoutGrid, Link, List, ListChecks, LoaderCircle, Lock, LogIn, LogOut, Mail, MapPin, MessageCircle, PaintRoller, Palette, Percent, Phone, PiggyBank, Plus, Printer, QrCode, Receipt, ReceiptText, RefreshCw, RotateCcw, RotateCw, Save, Scale, Search, Settings, Shapes, ShieldCheck, ShieldUser, SlidersHorizontal, SquarePen, Star, StickyNote, Store, Sun, Tag, Tags, Trash2, TrendingDown, TrendingUp, TriangleAlert, Truck, Upload, User, UserCheck, UserPen, UserPlus, UserRound, UserX, Users, Vault, Wallet, Wrench, X, Zap, ZoomIn };

export function iconComponent(fa) {
  if (!fa) return Circle;
  const name = String(fa).replace(/fa-(solid|regular|brands|light|thin|duotone)\s*/g, '').replace(/^fa-/, '').trim().split(/\s+/)[0];
  return COMPONENTS[MAP[name]] || Circle;
}

export default function Icon({ fa, size = '1em', className, style, strokeWidth = 1.9, spin = false, ...rest }) {
  const cmp = iconComponent(fa);
  const cls = [className, spin || /fa-spin/.test(String(fa || '')) ? 'icon-spin' : null].filter(Boolean).join(' ') || undefined;
  // createElement (bukan <Cmp />) supaya tidak dianggap "membuat komponen saat render".
  return createElement(cmp, {
    size,
    strokeWidth,
    className: cls,
    style: { verticalAlign: '-0.15em', flexShrink: 0, ...style },
    'aria-hidden': 'true',
    focusable: 'false',
    ...rest,
  });
}
