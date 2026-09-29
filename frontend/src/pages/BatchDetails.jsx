import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EvidenceList from '../components/EvidenceList';
import AiReportCard from '../components/AiReportCard';
import StatusBadge from '../components/StatusBadge';
import ScenarioBadge from '../components/ScenarioBadge';
import StatusTimeline from '../components/StatusTimeline';
import TxHashLink from '../components/TxHashLink';
import ChallengeModal from '../components/ChallengeModal';
import { 
  ArrowLeft, ShieldAlert, Coins, CheckCircle,
  ExternalLink, Weight, Layers, Building2, Calendar
} from 'lucide-react';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  const fetchBatch = async () => {
    setLoading(true);
    try {
      const data = await api.getBatchById(id);
      setBatch(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const handleChallengeSubmitted = async (challengeData) => {
    await api.challengeBatch(batch.id, challengeData);
    await fetchBatch();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32, height: 32,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--teal)',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin-slow 1s linear infinite'
            }}
          />
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Loading batch evidence record...
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Batch {id} not found in verified registry.</p>
        <button 
          onClick={() => navigate('/')} 
          className="btn-secondary"
          style={{ marginTop: 12 }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header Card */}
      <div
        className="animate-reveal-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
            style={{ padding: '8px' }}
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {batch.id}
              </h2>
              <ScenarioBadge scenario={batch.scenario} />
              <StatusBadge status={batch.status} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {batch.material} · Facility: {batch.recycler}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {batch.status !== 'CHALLENGED' && (
            <button
              onClick={() => setIsChallengeOpen(true)}
              className="btn-danger"
              style={{ padding: '8px 14px', fontSize: 12 }}
            >
              <ShieldAlert size={14} />
              <span>Challenge Batch</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/verification?batchId=${batch.id}`)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            <ExternalLink size={14} />
            <span>Forensic Verification</span>
          </button>
        </div>
      </div>

      {/* Primary 4-Metric Mass Balance Cards */}
      <div
        className="animate-reveal-up stagger-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}
      >
        {[
          { label: 'Intake Mass', val: `${batch.inputWeight} kg`, sub: 'Weighbridge intake record', color: 'var(--earth)' },
          { label: 'Processed Mass', val: `${batch.processedWeight || Math.round(batch.inputWeight * 0.95)} kg`, sub: 'Reactor throughput log', color: 'var(--orange)' },
          { label: 'Claimed Recovery', val: `${batch.claimedRecoveredWeight} kg`, sub: 'Laboratory assay output', color: 'var(--gold)' },
          { label: 'Verified Output', val: `${batch.downstreamWeight || 675} kg`, sub: 'Downstream off-taker receipt', color: batch.status === 'VERIFIED' ? 'var(--success)' : 'var(--teal)' },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '16px 18px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span className="label-caps-sm">{m.label}</span>
            <div className="font-mono font-bold" style={{ fontSize: 20, color: m.color, marginTop: 4, letterSpacing: '-0.02em' }}>
              {m.val}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
              {m.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Main Grid: Evidence & AI Report */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <AiReportCard report={batch.aiReport} />
          <StatusTimeline status={batch.status} createdAt={batch.createdAt} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <EvidenceList 
            evidence={batch.evidence} 
            evidenceRoot={batch.evidenceRoot} 
            integrityStatus={batch.integrityStatus} 
          />

          {/* Blockchain & Settlement Snapshot */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '14px',
              }}
            >
              <span className="label-caps">MST Testnet Attestation Anchor</span>
              <StatusBadge status={batch.settlement?.status || 'PENDING'} size="sm" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Attestation ID:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--teal)' }}>
                  {batch.blockchain?.attestationId || 'ATT-4242-9901'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Network & Block:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--text)' }}>
                  MST Testnet #{batch.blockchain?.blockNumber || '8,841'}
                </span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Transaction Hash:</span>
                <TxHashLink hash={batch.blockchain?.txHash} truncate={false} />
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Escrow Value:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--teal)', fontSize: 13 }}>
                  ₹{(batch.settlement?.amountINR || 50000).toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Release Transaction:</span>
                <TxHashLink hash={batch.settlement?.releaseTx} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        batch={batch}
        onChallengeSubmitted={handleChallengeSubmitted}
      />
    </div>
  );
}
