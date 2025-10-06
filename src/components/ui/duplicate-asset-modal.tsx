'use client';

import React, { useState } from 'react';
import { X, Copy, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category: string;
  condition: string;
  location: string;
}

interface DuplicateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => Promise<void>;
  asset: Asset | null;
}

export default function DuplicateAssetModal({
  isOpen,
  onClose,
  onConfirm,
  asset
}: DuplicateAssetModalProps) {
  const [newAssetName, setNewAssetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen && asset) {
      setNewAssetName(`${asset.name} - Copy`);
      setError('');
    }
  }, [isOpen, asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssetName.trim()) {
      setError('Nama aset tidak boleh kosong');
      return;
    }

    if (newAssetName.trim() === asset?.name) {
      setError('Nama aset harus berbeda dari aset asli');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(newAssetName.trim());
      handleClose();
    } catch (err) {
      setError('Gagal menduplikasi aset. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewAssetName('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Copy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Duplikasi Aset
                </h3>
                <p className="text-sm text-gray-500">
                  Buat salinan dari aset yang dipilih
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Original Asset Info */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900">{asset.name}</h4>
                  <p className="text-sm text-gray-600">
                    {asset.brand || ''} {asset.model || ''}
                  </p>
                  {asset.serialNumber && (
                    <p className="text-xs text-gray-500">
                      SN: {asset.serialNumber}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Kategori: {asset.category}</span>
                    <span>•</span>
                    <span>Lokasi: {asset.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newAssetName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Aset Baru
                </label>
                <input
                  type="text"
                  id="newAssetName"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Masukkan nama untuk aset yang diduplikasi"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Info Box */}
              <div className="flex items-start space-x-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Yang akan diduplikasi:</p>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• Semua informasi aset (brand, model, kategori, dll)</li>
                    <li>• Status kondisi dan lokasi</li>
                    <li>• Serial number akan dikosongkan</li>
                  </ul>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !newAssetName.trim()}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menduplikasi...</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Duplikasi Aset</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}