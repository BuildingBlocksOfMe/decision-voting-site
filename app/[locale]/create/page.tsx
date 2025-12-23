'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Locale } from '@/i18n.config';
import { CreatePostRequest } from '@/types';
import { saveAuthorToken } from '@/lib/results';

export default function CreatePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Simple translations (could be improved with proper i18n)
  const isJapanese = locale === 'ja';

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (title.trim().length === 0) {
      setError(isJapanese ? 'タイトルを入力してください' : 'Please enter a title');
      return;
    }

    if (description.trim().length === 0) {
      setError(isJapanese ? '説明を入力してください' : 'Please enter a description');
      return;
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError(isJapanese ? '最低2つの選択肢が必要です' : 'At least 2 options are required');
      return;
    }

    setSubmitting(true);

    try {
      const requestBody: CreatePostRequest = {
        title: title.trim(),
        description: description.trim(),
        options: validOptions.map(opt => opt.trim()),
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create post');
      }

      const data = await response.json();
      
      // Save author token to localStorage
      saveAuthorToken(data.post.id, data.authorToken);
      
      // Redirect to the new post
      router.push(`/${locale}/post/${data.post.id}`);
    } catch (err: any) {
      console.error('Error creating post:', err);
      const errorMessage = err?.message || (isJapanese ? '投稿の作成に失敗しました' : 'Failed to create post');
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {isJapanese ? '新規投稿を作成' : 'Create New Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isJapanese ? 'タイトル' : 'Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isJapanese ? '例：どの転職先を選ぶべき？' : 'e.g., Which job offer should I accept?'}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isJapanese ? '状況説明' : 'Description'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isJapanese ? 'あなたの状況や悩みを詳しく説明してください...' : 'Describe your situation and dilemma in detail...'}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
            disabled={submitting}
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isJapanese ? '選択肢' : 'Options'}
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`${isJapanese ? '選択肢' : 'Option'} ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    disabled={submitting}
                  >
                    {isJapanese ? '削除' : 'Remove'}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 10 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              disabled={submitting}
            >
              {isJapanese ? '選択肢を追加' : 'Add Option'}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting
              ? (isJapanese ? '投稿中...' : 'Creating...')
              : (isJapanese ? '投稿する' : 'Create Post')}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            disabled={submitting}
          >
            {isJapanese ? 'キャンセル' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
}

